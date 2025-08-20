# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses Bun as the package manager and runtime.

### Essential Commands
- `bun dev` - Start development server (Next.js)
- `bun build` - Build for production  
- `bun lint` - Run ESLint
- `bun start` - Start production server

### Utility Commands
- `bun types` - Generate TypeScript types from Supabase database
- `bun shadcn` - Add shadcn/ui components
- `bun postshadcn` - Migrate Radix UI components after shadcn updates

## Architecture Overview

### Stack
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **State Management**: Zustand for global state, TanStack Query for server state
- **UI Components**: Custom components built on Radix UI primitives
- **Internationalization**: lingo.dev with English as source locale and Polish as target
- **Package Manager**: Bun 1.2.19

### Project Structure
The codebase follows a feature-based architecture:

```
src/
├── app/                    # Next.js App Router pages and API routes
├── components/             # Shared UI components 
│   └── ui/                # Base UI components (buttons, forms, etc.)
├── features/              # Feature modules (each self-contained)
│   ├── auth/              # Authentication & user management
│   ├── inbox/             # Tender inbox and filtering
│   ├── tenders/           # Tender management and kanban
│   ├── tender-form/       # Multi-step tender form
│   ├── navigation/        # Dashboard navigation and command palette
│   ├── hub/               # Dashboard homepage widgets
│   └── i18n/              # Internationalization utilities
├── lib/                   # Core utilities and configurations
│   └── supabase/          # Database client configurations
└── types/                 # TypeScript type definitions
```

### Key Patterns

**Feature Organization**: Each feature in `src/features/` contains:
- `api/` - React Query hooks for data fetching  
- `components/` - Feature-specific UI components
- `hooks/` - Custom React hooks
- `utils/` - Feature-specific utilities
- `types/` - Feature-specific type definitions
- `index.ts` - Barrel exports

**Database Integration**: 
- Supabase types are auto-generated in `src/types/supabase.ts`
- Client configurations split between browser (`client.ts`), server (`server.ts`), and middleware (`middleware.ts`)
- Database schema includes tables for tenders, tender parts, requirements, comments, and user management

**State Management**:
- Server state managed via TanStack Query with custom hooks
- Global client state managed via Zustand stores
- Form state typically managed via react-hook-form with Zod validation

**UI System**:
- Components built on Radix UI primitives with consistent styling via class-variance-authority
- Tailwind CSS v4 for styling with custom utility classes
- Motion library for animations
- Responsive design with mobile-first approach

**Internationalization**:
- lingo.dev handles translations with support for English (source) and Polish
- Translation files in `src/lingo/` directory
- Components use translation keys rather than hardcoded strings

### Domain Context
This is the Mimira Agentic Platform - a tender/procurement management system that helps companies:
- View and filter incoming tenders in an inbox interface
- Manage tenders through a kanban-style workflow
- Fill out multi-step tender forms with confirmations
- Track tender deadlines and statistics
- Collaborate via comments and status updates

Key business entities include tenders, tender parts, requirements, products, and companies.