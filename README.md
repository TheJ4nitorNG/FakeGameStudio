# Fake Game Foundry

## Overview

A SQL Editor and Database Management tool designed for managing a "Fake Game Studio" PostgreSQL database. The application provides a browser-based interface for executing SQL queries, browsing database schemas, and managing tables. Built with a React frontend and Express backend, it connects to a PostgreSQL database (Supabase or standard Postgres) for data operations.
Basically, a program that teaches you the fundamentals of game development, in a "game-like" atmosphere. Create your own characters in the sprite editor, build their personalities and backstories, build out your world, and then "publish" your game! Gives you the option to learn GameMaker, RPGMAKER or Unity. More engines will be added as development/updates continue

The platform follows a professional game dev aesthetic with satirical personality, supporting entities like game studios, games, and dev posts with status enums (active/bankrupt/canceled/legendary etc.).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Build Tool**: Vite with React plugin

**Key Frontend Components**:
- `SqlEditor`: Interactive SQL query editor with syntax highlighting and execution
- `SchemaBrowser`: Database schema navigation sidebar
- `ThemeToggle`: Light/dark mode switcher

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Driver**: node-postgres (pg)

**API Structure**:
- `POST /api/sql/execute` - Execute raw SQL queries against the database
- `GET /api/sql/test` - Test database connection status

### Data Storage
- **Database**: PostgreSQL (designed for and currently hosted on Supabase but compatible with standard Postgres)
- **Schema Location**: `shared/schema.ts` using Drizzle ORM definitions
- **Migrations**: Drizzle Kit with output to `./migrations` directory

**Database Entities** (planned from attached SQL schema):
- Studios with status enum (active, acquired, bankrupt, missing, hibernating)
- Games with status enum (prototype, in_development, early_access, released, canceled, legendary)
- Posts with type enum (devlog, patch_notes, announcement, apology, cancellation, postmortem)

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/      # UI components (including shadcn/ui)
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities (queryClient, theme, utils)
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API route definitions
│   ├── db.ts            # Database connection
│   └── storage.ts       # In-memory storage fallback
├── shared/              # Shared types and schema
│   └── schema.ts        # Drizzle schema definitions
└── migrations/          # Database migrations
```

### Build System
- Development: `tsx` for TypeScript execution with Vite dev server
- Production: esbuild for server bundling, Vite for client build
- Server dependencies are selectively bundled to optimize cold start times

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` or `SUPABASE_DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and query building
- **SSL**: Configured with `rejectUnauthorized: false` for Supabase compatibility

### UI Dependencies
- **Radix UI**: Full suite of accessible UI primitives (dialog, dropdown, tabs, etc.)
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **embla-carousel-react**: Carousel functionality
- **react-day-picker**: Date picker component
- **recharts**: Charting library
- **vaul**: Drawer component

### Development Tools
- **Drizzle Kit**: Database migration tooling

### Fonts (loaded via Google Fonts)
- DM Sans, Fira Code, Geist Mono, Architects Daughter
- 
**And that is Fake Game Foundry. Now go forth and fucking CREATE. BUILD GAMES. MAKE GAMES. YOU CAN BE A GAME DEVELOPER. YOU CAN DO IT. I BELIEVE IN YOU.**

# ROADMAP/UPCOMING ADDITIONS TO DESIGN

## Design Approach

**Reference-Based Approach** drawing inspiration from:
- **Discord/Slack**: Community-focused layouts with sidebar navigation
- **GitHub/Linear**: Clean developer aesthetics, project organization
- **Steam/itch.io**: Game showcasing, browsing experiences
- **Notion**: Flexible content presentation, card-based layouts

**Design Philosophy**: Professional game dev platform aesthetic with subtle satirical personality. Balance credibility (feels like a real dev platform) with creative chaos (celebrates the absurd).

## Typography

**Font Stack**:
- **Primary**: Inter (UI, body text) - clean, developer-friendly
- **Display**: Space Grotesk (headings, studio names) - geometric, modern gaming feel
- **Mono**: JetBrains Mono (code snippets, fake patch notes) - authentic dev aesthetic

**Hierarchy**:
- Hero/Studio Names: text-5xl to text-6xl, font-bold
- Section Headers: text-3xl to text-4xl, font-semibold
- Card Titles/Project Names: text-xl to text-2xl, font-semibold
- Body Text: text-base, leading-relaxed
- Metadata/Tags: text-sm, font-medium

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16, 20** for consistent rhythm
- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-4, gap-6, gap-8

**Container Strategy**:
- Max width: max-w-7xl for main content areas
- Sidebar: fixed w-64 or w-72 for navigation
- Content grids: 2-3 columns on desktop (grid-cols-2 lg:grid-cols-3)

## Core Components

**Navigation**:
- Persistent sidebar (desktop) with collapsed mobile drawer
- Categories: Trending Studios, Active Projects, Cursed Engines, Patch Notes Archive
- User profile dropdown, notifications bell

**Studio/Project Cards**:
- Prominent featured image/fake game screenshot
- Studio name with verified-style badge (satirical)
- Description snippet with "Last Updated" timestamp
- Tags for engine types, genres, status (In Development, Cancelled, Cursed)
- Engagement metrics: followers, fake commit count

**Content Blocks**:
- **Patch Notes**: Terminal-style code blocks with mono font
- **Dev Logs**: Blog-style posts with rich formatting
- **Project Graveyard**: Faded styling for cancelled projects
- **Engine Showcase**: Split layout with specs on left, cursed features on right

**Forms & Inputs**:
- Rounded corners (rounded-lg)
- Clear labels above fields
- Placeholder text with dev humor ("e.g., Unity but worse")
- Create Studio/Project CTAs prominently featured

## Upcoming Engine Additions
- UnrealEngine
- Godot
- CryEngine
- Roblox Studio (gross, I know, but it's extremely popular.)



## Page Structures

**Landing Page**:
- Hero: Full-width featured studio carousel with blurred backdrop, white text, glass-morphism CTA buttons
- Trending Studios: 3-column grid of studio cards
- Recent Patch Notes: 2-column feed with terminal aesthetic
- Community Highlights: Featured cursed engines or cancelled projects
- Footer: Quick links, fake API docs link, social

**Studio Profile**:
- Cover banner image (fake game art)
- Studio info sidebar: name, fake founding date, member count
- Main content: Tabbed interface (Projects, Patch Notes, About, Cursed Commits)
- Project grid with filtering options

**Project Detail**:
- Hero image (fake screenshot/concept art)
- Breadcrumb navigation
- Left column: Project details, tech stack (satirical), status
- Right column: Latest updates, fake changelogs
- Comment section for "feedback" and roleplay

## Visual Elements

**Imagery**:
- Hero sections: Yes - full-width banners featuring user-uploaded fake game art
- Project cards: Thumbnail images (16:9 aspect ratio)
- Studio avatars: Circular, 40px-64px depending on context
- Placeholder graphics: Retro pixel art or glitch aesthetics when no image

**Iconography**:
- Use **Heroicons** for UI elements (navigation, actions)
- Custom badges/status indicators for project states

**Animations**:
- Minimal, purposeful: Card hover lift (subtle), skeleton loading states
- Page transitions: Smooth fade-ins for content
- No distracting scroll animations

## Distinctive Features

- **"Verified Fake" Badges**: Playful checkmarks for established studios
- **Commit Graph Parody**: Fake activity graphs on studio profiles
- **Status Pills**: Color-coded tags (Active, Hiatus, Gloriously Broken, Cancelled)
- **Terminal Themes**: Dark mode code blocks for patch notes with syntax highlighting
- **Brutalist Touches**: Occasional bold typography, raw borders to contrast with polish

## Accessibility

- High contrast ratios for text readability
- Keyboard navigation throughout
- ARIA labels for interactive elements
- Focus indicators on all interactive components
- Semantic HTML structure for screen readers

---

**Design Personality**: Think Linear meets Discord meets itch.io — clean, organized developer interface with room for creative chaos and satirical flair. Professional enough to feel "real," playful enough to celebrate the absurd.
