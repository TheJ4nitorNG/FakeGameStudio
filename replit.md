# Fake Game Studio Creator Platform

## Overview

A SQL Editor and Database Management tool designed for managing a "Fake Game Studio" PostgreSQL database. The application provides a browser-based interface for executing SQL queries, browsing database schemas, and managing tables. Built with a React frontend and Express backend, it connects to a PostgreSQL database (Supabase or standard Postgres) for data operations.

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
- **Database**: PostgreSQL (designed for Supabase but compatible with standard Postgres)
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
- **Replit Plugins**: Error overlay, cartographer, dev banner (development only)
- **Drizzle Kit**: Database migration tooling

### Fonts (loaded via Google Fonts)
- DM Sans, Fira Code, Geist Mono, Architects Daughter