Learn the fundimentals of Game Development through a simple game-style UI.
Teaches you everything from sprite creation to world building, and teaches you the basics of code through fun puzzles.
Choose from 3 different game engines to learn the code! Currently offers: Game MAker Studio (GML), RPGMaker (JavaScript, RGSS), and Unity (C#). Will be adding more engines in the future!

The Character Creator allows you to add a personality to your sprites, bringing your characters to life! Give them deep backstories, thing Dungeons and Dragons style!
The World Builder allows you to create and craft the world your characters live in! Get as detailed as you can, and you can come back and add more as you go!

The Code Cauldron currently gives you the choice between learning GML (Game Maker Language), RPGMaker (JavaScript) and Unity (C#). I've crafted simple code puzzles for you to solve, 
Learning to code hands-on. I will be adding more choices for game engines in later updates (UnrealEngine, Godot, CryEngine, Roblox Studio <eww, I know, but it's extremely popular).

When you feel you've completed the game, you can "publish" it for other users to check out, you can put it in Dev Hell, or you can banish it to the shadow realm. I will be adding more in-depth
pieces to publishing, I woud like for it to teach you the ins and outs of publishing a game, IE advertising, choosing a platform to release, etc.

Fake Game Foundry is an all-in-one way to learn game development, broken down and simplified. My goal with FGF is to continue to birth a new generation of game developers,
and to show people that it's not incredibly complicated. Yes, building a game is a large task, and it's not mickey-mouse simple; but I aim to break it down to bite-sized
pieces for people to understand that it's fun, and it's doable.

# FakeGameStudio

A program that teaches you the fundamentals of game development, in a "game-like" atmosphere. Create your own characters in the sprite editor, build their personalities and backstories, build out your world, and then "publish" your game! Gives you the option to learn GameMaker, RPGMAKER or Unity.

---

## Architecture Overview

This project is built using a modern, full-stack TypeScript architecture, separating the client-side user interface from the server-side API and database operations. 

### Frontend Architecture
The frontend is a single-page application (SPA) built for high performance and rapid development.
* **Core Framework:** [React](https://react.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/) for strong type safety and better developer experience.
* **Build Tool & Bundler:** [Vite](https://vitejs.dev/) (`vite.config.ts`) for extremely fast Hot Module Replacement (HMR) and optimized production builds.
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (`tailwind.config.ts`, `postcss.config.js`) for utility-first, responsive styling.
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (indicated by `components.json`) for accessible, customizable UI components.
* **State Management/Logic:** Custom React hooks (located in the `hooks/` directory).

### Backend Architecture
The backend serves as a robust API to handle business logic, data persistence, and communication with the frontend.
* **Runtime Environment:** [Node.js](https://nodejs.org/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) (`drizzle.config.ts`) for type-safe database queries and schema management.
* **API/Server:** A Node.js web server handling requests and serving data to the client.

### Shared Resources
* **Shared Code:** The `shared/` directory is used to maintain single sources of truth for both the frontend and backend. This typically includes TypeScript interfaces, validation schemas, and Drizzle database schemas so the client and server stay perfectly in sync.

### Deployment & DevOps
* **Containerization:** [Docker](https://www.docker.com/) (`Dockerfile`, `.dockerignore`) is used to containerize the application for consistent environments across development and production.
* **Hosting:** Configured for deployment on [Fly.io](https://fly.io/) (indicated by `fly.toml`).

---

## 📁 Project Structure

This repository is organized into distinct directories to cleanly separate concerns between the frontend, backend, and shared utilities.

```text
FakeGameStudio/
├── attached_assets/   # Media, images, sprites, and other static assets
├── client/            # The React/Vite frontend application (UI, pages, routing)
├── hooks/             # Custom reusable React hooks or project-level Git hooks
├── info/              # Documentation, project notes, or supplementary info
├── refs/              # Project references, configurations, or version control refs
├── script/            # Utility scripts for database migrations, seeding, or builds
├── server/            # The Node.js backend application (API, logic, database)
├── shared/            # TypeScript types, Drizzle schemas, and validation logic
├── Dockerfile         # Containerization instructions for deployment
├── drizzle.config.ts  # Configuration for the Drizzle ORM
├── fly.toml           # Deployment configuration for Fly.io
├── tailwind.config.ts # Configuration for Tailwind CSS styling
└── vite.config.ts     # Configuration for the Vite build tool

```text
Directory Highlights
• client/: Everything the user sees and interacts with lives here. It handles state, UI rendering, and communicating with the backend API.
• server/: The brain of the operation. It securely handles database operations, processes game data, and serves the frontend.
• shared/: A crucial folder for full-stack TypeScript apps. By keeping database schemas and types here, the frontend and backend remain perfectly in sync, preventing data mismatch bugs.
• script/: Handy automations and terminal scripts to make local development and database management smoother.


**And that is Fake Game Foundry. Now go forth and fucking CREATE. BUILD GAMES. MAKE GAMES. YOU CAN BE A GAME DEVELOPER. YOU CAN DO IT. I BELIEVE IN YOU.**
