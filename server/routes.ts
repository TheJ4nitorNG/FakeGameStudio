import type { Express } from "express";
import { createServer, type Server } from "http";
import { pool } from "./db";
import type { SqlExecuteResult, TableSchema, Studio, Game, Post, Tag, StudioWithGames, GameWithStudio, PostWithRelations, Project, Sprite, Character, World, ProjectWithAssets } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============ SQL EDITOR ROUTES ============
  
  // Execute SQL query
  app.post("/api/sql/execute", async (req, res) => {
    const { query } = req.body;
    
    if (!query || typeof query !== "string") {
      return res.status(400).json({ 
        success: false, 
        error: "Query is required" 
      });
    }

    const startTime = Date.now();
    
    try {
      const result = await pool.query(query);
      const executionTime = Date.now() - startTime;
      
      const columns = result.fields?.map(f => f.name) || [];
      const rows = result.rows || [];
      
      const response: SqlExecuteResult = {
        success: true,
        rows,
        columns,
        rowCount: result.rowCount ?? rows.length,
        executionTime,
      };
      
      res.json(response);
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      const response: SqlExecuteResult = {
        success: false,
        error: error.message || "Query execution failed",
        executionTime,
      };
      
      res.status(400).json(response);
    }
  });

  // Get database schema (tables and columns)
  app.get("/api/sql/schema", async (req, res) => {
    try {
      const tablesQuery = `
        SELECT 
          c.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT ku.column_name, ku.table_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = 'public'
        ) pk ON c.column_name = pk.column_name AND c.table_name = pk.table_name
        WHERE c.table_schema = 'public'
        ORDER BY c.table_name, c.ordinal_position
      `;
      
      const result = await pool.query(tablesQuery);
      
      const schemaMap = new Map<string, TableSchema>();
      
      for (const row of result.rows) {
        const tableName = row.table_name;
        
        if (!schemaMap.has(tableName)) {
          schemaMap.set(tableName, {
            tableName,
            columns: [],
          });
        }
        
        schemaMap.get(tableName)!.columns.push({
          name: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === "YES",
          isPrimaryKey: row.is_primary_key,
        });
      }
      
      const tables = Array.from(schemaMap.values());
      res.json({ tables });
    } catch (error: any) {
      res.status(500).json({ 
        error: error.message || "Failed to fetch schema" 
      });
    }
  });

  // Test database connection
  app.get("/api/sql/test", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ connected: true });
    } catch (error: any) {
      res.status(500).json({ 
        connected: false, 
        error: error.message 
      });
    }
  });

  // ============ STUDIOS ROUTES ============

  // Get all studios
  app.get("/api/studios", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM studios 
        ORDER BY created_at DESC
      `);
      res.json(result.rows as Studio[]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get studio by slug with games
  app.get("/api/studios/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Get studio
      const studioResult = await pool.query(
        `SELECT * FROM studios WHERE slug = $1`,
        [slug]
      );
      
      if (studioResult.rows.length === 0) {
        return res.status(404).json({ error: "Studio not found" });
      }
      
      const studio = studioResult.rows[0] as Studio;
      
      // Get studio's games
      const gamesResult = await pool.query(
        `SELECT * FROM games WHERE studio_id = $1 ORDER BY created_at DESC`,
        [studio.id]
      );
      
      const response: StudioWithGames = {
        ...studio,
        games: gamesResult.rows as Game[],
      };
      
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get studio's posts
  app.get("/api/studios/:slug/posts", async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Get studio ID first
      const studioResult = await pool.query(
        `SELECT id FROM studios WHERE slug = $1`,
        [slug]
      );
      
      if (studioResult.rows.length === 0) {
        return res.status(404).json({ error: "Studio not found" });
      }
      
      const studioId = studioResult.rows[0].id;
      
      // Get posts for studio's games or directly from studio
      const postsResult = await pool.query(`
        SELECT p.*, g.title as game_title, g.slug as game_slug
        FROM posts p
        LEFT JOIN games g ON p.game_id = g.id
        WHERE g.studio_id = $1 OR p.studio_id = $1
        ORDER BY p.created_at DESC
      `, [studioId]);
      
      res.json(postsResult.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GAMES ROUTES ============

  // Get game by studio slug and game slug
  app.get("/api/studios/:studioSlug/games/:gameSlug", async (req, res) => {
    try {
      const { studioSlug, gameSlug } = req.params;
      
      // Get studio first
      const studioResult = await pool.query(
        `SELECT * FROM studios WHERE slug = $1`,
        [studioSlug]
      );
      
      if (studioResult.rows.length === 0) {
        return res.status(404).json({ error: "Studio not found" });
      }
      
      const studio = studioResult.rows[0] as Studio;
      
      // Get game
      const gameResult = await pool.query(
        `SELECT * FROM games WHERE studio_id = $1 AND slug = $2`,
        [studio.id, gameSlug]
      );
      
      if (gameResult.rows.length === 0) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const game = gameResult.rows[0] as Game;
      
      const response: GameWithStudio = {
        ...game,
        studio,
      };
      
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get game's posts
  app.get("/api/studios/:studioSlug/games/:gameSlug/posts", async (req, res) => {
    try {
      const { studioSlug, gameSlug } = req.params;
      const { type } = req.query;
      
      // Get studio first
      const studioResult = await pool.query(
        `SELECT id FROM studios WHERE slug = $1`,
        [studioSlug]
      );
      
      if (studioResult.rows.length === 0) {
        return res.status(404).json({ error: "Studio not found" });
      }
      
      // Get game
      const gameResult = await pool.query(
        `SELECT id FROM games WHERE studio_id = $1 AND slug = $2`,
        [studioResult.rows[0].id, gameSlug]
      );
      
      if (gameResult.rows.length === 0) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const gameId = gameResult.rows[0].id;
      
      // Get posts
      let query = `SELECT * FROM posts WHERE game_id = $1`;
      const params: any[] = [gameId];
      
      if (type) {
        query += ` AND type = $2`;
        params.push(type);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const postsResult = await pool.query(query, params);
      res.json(postsResult.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ POSTS ROUTES ============

  // Create a new post
  app.post("/api/posts", async (req, res) => {
    try {
      const { title, type, version, body_md } = req.body;
      
      if (!title || !body_md) {
        return res.status(400).json({ error: "Title and statement body are required" });
      }

      const result = await pool.query(
        `INSERT INTO posts (title, type, version, body_md)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [title, type || "devlog", version || null, body_md]
      );
      
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Database insert failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get public feed
  app.get("/api/posts", async (req, res) => {
    try {
      const { type, limit = 20 } = req.query;
      
      let query = `
        SELECT 
          p.*,
          g.title as game_title,
          g.slug as game_slug,
          s.name as studio_name,
          s.slug as studio_slug
        FROM posts p
        LEFT JOIN games g ON p.game_id = g.id
        LEFT JOIN studios s ON g.studio_id = s.id OR p.studio_id = s.id
      `;
      
      const params: any[] = [];
      
      if (type && type !== "all") {
        query += ` WHERE p.type = $1`;
        params.push(type);
      }
      
      query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1}`;
      params.push(Number(limit));
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single post by ID
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get post with relations
      const postResult = await pool.query(`
        SELECT 
          p.*,
          g.title as game_title,
          g.slug as game_slug,
          g.cover_url as game_cover_url,
          s.name as studio_name,
          s.slug as studio_slug
        FROM posts p
        LEFT JOIN games g ON p.game_id = g.id
        LEFT JOIN studios s ON g.studio_id = s.id OR p.studio_id = s.id
        WHERE p.id = $1
      `, [id]);
      
      if (postResult.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      const post = postResult.rows[0];
      
      // Get tags for this post
      const tagsResult = await pool.query(`
        SELECT t.* FROM tags t
        JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = $1
      `, [id]);
      
      res.json({
        ...post,
        tags: tagsResult.rows,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ TAGS ROUTES ============

  // Get all tags
  app.get("/api/tags", async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM tags ORDER BY name`);
      res.json(result.rows as Tag[]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ PROJECTS ROUTES (Game Creation) ============

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const { fate } = req.query;
      
      let query = `SELECT * FROM projects`;
      const params: any[] = [];
      
      if (fate && fate !== "all") {
        query += ` WHERE fate = $1`;
        params.push(fate);
      }
      
      query += ` ORDER BY updated_at DESC`;
      
      const result = await pool.query(query, params);
      res.json(result.rows as Project[]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single project with all assets
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const projectResult = await pool.query(
        `SELECT * FROM projects WHERE id = $1`,
        [id]
      );
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const project = projectResult.rows[0] as Project;
      
      // Get sprites
      const spritesResult = await pool.query(
        `SELECT * FROM sprites WHERE project_id = $1 ORDER BY created_at`,
        [id]
      );
      
      // Get characters
      const charactersResult = await pool.query(
        `SELECT * FROM characters WHERE project_id = $1 ORDER BY created_at`,
        [id]
      );
      
      // Get world
      const worldResult = await pool.query(
        `SELECT * FROM worlds WHERE project_id = $1 LIMIT 1`,
        [id]
      );
      
      const response: ProjectWithAssets = {
        ...project,
        sprites: spritesResult.rows as Sprite[],
        characters: charactersResult.rows as Character[],
        world: worldResult.rows[0] as World || null,
      };
      
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new project
  app.post("/api/projects", async (req, res) => {
    try {
      const { title, tagline, genre } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      
      const result = await pool.query(
        `INSERT INTO projects (title, tagline, genre, fate, current_step)
         VALUES ($1, $2, $3, 'in_progress', 'sprite')
         RETURNING *`,
        [title, tagline || null, genre || null]
      );
      
      res.json(result.rows[0] as Project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, tagline, genre, currentStep, fate } = req.body;
      
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (tagline !== undefined) {
        updates.push(`tagline = $${paramCount++}`);
        values.push(tagline);
      }
      if (genre !== undefined) {
        updates.push(`genre = $${paramCount++}`);
        values.push(genre);
      }
      if (currentStep !== undefined) {
        updates.push(`current_step = $${paramCount++}`);
        values.push(currentStep);
      }
      if (fate !== undefined) {
        updates.push(`fate = $${paramCount++}`);
        values.push(fate);
        if (fate === "released") {
          updates.push(`released_at = NOW()`);
        }
      }
      
      updates.push(`updated_at = NOW()`);
      values.push(id);
      
      const result = await pool.query(
        `UPDATE projects SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(result.rows[0] as Project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete related data first
      await pool.query(`DELETE FROM sprites WHERE project_id = $1`, [id]);
      await pool.query(`DELETE FROM characters WHERE project_id = $1`, [id]);
      await pool.query(`DELETE FROM worlds WHERE project_id = $1`, [id]);
      
      const result = await pool.query(
        `DELETE FROM projects WHERE id = $1 RETURNING *`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ SPRITES ROUTES ============

  // Get ALL sprites for the gallery
  app.get("/api/sprites", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT s.*, p.title as project_title 
        FROM sprites s
        JOIN projects p ON s.project_id = p.id
        ORDER BY s.created_at DESC
      `);
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Save sprite
  app.post("/api/projects/:projectId/sprites", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { name, width, height, pixelData, palette } = req.body;
      
      if (!name || !pixelData) {
        return res.status(400).json({ error: "Name and pixel data required" });
      }
      
      const result = await pool.query(
        `INSERT INTO sprites (project_id, name, width, height, pixel_data, palette)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [projectId, name, width || 16, height || 16, pixelData, palette || []]
      );
      
      // Update project step
      await pool.query(
        `UPDATE projects SET current_step = 'character', updated_at = NOW() WHERE id = $1`,
        [projectId]
      );
      
      res.json(result.rows[0] as Sprite);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update sprite
  app.patch("/api/sprites/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, pixelData, palette } = req.body;
      
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (pixelData !== undefined) {
        updates.push(`pixel_data = $${paramCount++}`);
        values.push(pixelData);
      }
      if (palette !== undefined) {
        updates.push(`palette = $${paramCount++}`);
        values.push(palette);
      }
      
      values.push(id);
      
      const result = await pool.query(
        `UPDATE sprites SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
        values
      );
      
      res.json(result.rows[0] as Sprite);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ CHARACTERS ROUTES ============

  // Get ALL characters for the gallery
  app.get("/api/characters", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT c.*, p.title as project_title 
        FROM characters c
        JOIN projects p ON c.project_id = p.id
        ORDER BY c.created_at DESC
      `);
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Save character
  app.post("/api/projects/:projectId/characters", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { name, role, archetype, backstory, traits, catchphrase } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Character name required" });
      }
      
      const result = await pool.query(
        `INSERT INTO characters (project_id, name, role, archetype, backstory, traits, catchphrase)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [projectId, name, role || null, archetype || null, backstory || null, traits || [], catchphrase || null]
      );
      
      // Update project step
      await pool.query(
        `UPDATE projects SET current_step = 'world', updated_at = NOW() WHERE id = $1`,
        [projectId]
      );
      
      res.json(result.rows[0] as Character);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ WORLDS ROUTES ============

  // Save world
  app.post("/api/projects/:projectId/world", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { setting, lore, mechanics, inspirations, tone } = req.body;
      
      // Upsert - update if exists, insert if not
      const existing = await pool.query(
        `SELECT id FROM worlds WHERE project_id = $1`,
        [projectId]
      );
      
      let result;
      if (existing.rows.length > 0) {
        result = await pool.query(
          `UPDATE worlds SET setting = $1, lore = $2, mechanics = $3, inspirations = $4, tone = $5
           WHERE project_id = $6 RETURNING *`,
          [setting, lore, mechanics, inspirations || [], tone, projectId]
        );
      } else {
        result = await pool.query(
          `INSERT INTO worlds (project_id, setting, lore, mechanics, inspirations, tone)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [projectId, setting, lore, mechanics, inspirations || [], tone]
        );
      }
      
      // Update project step
      await pool.query(
        `UPDATE projects SET current_step = 'fate', updated_at = NOW() WHERE id = $1`,
        [projectId]
      );
      
      res.json(result.rows[0] as World);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
