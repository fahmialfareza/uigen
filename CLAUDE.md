# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

Use comments sparingly — only for complex or non-obvious logic.

## Commands

```bash
npm run dev          # Start dev server with Turbopack (port 3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run Vitest unit tests
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Reset database (destructive)
```

To run a single test file: `npx vitest run <path/to/test>`

## Environment Setup

Copy `.env` and set:
- `ANTHROPIC_API_KEY` — optional; without it the app uses a mock provider that returns demo components
- `JWT_SECRET` — defaults to `"development-secret-key"` in development

## Architecture

UIGen is a Next.js 15 app where users describe React components in natural language and see live previews. The core flow is:

1. User sends a message → `src/app/api/chat/route.ts` streams a response from Claude (claude-haiku-4-5 via `@ai-sdk/anthropic`)
2. Claude calls two tools to generate files: `str_replace_editor` (create/edit files) and `file_manager` (rename/delete)
3. The virtual file system updates → `PreviewFrame` transforms JSX via Babel standalone and renders it in a sandboxed iframe

### Key Subsystems

**Virtual File System** (`src/lib/file-system.ts`)
In-memory file tree with no disk I/O. Supports full CRUD, serialization/deserialization to JSON (stored in the `Project.data` DB column). All file operations go through this class.

**AI Provider** (`src/lib/provider.ts`)
Wraps `@ai-sdk/anthropic`. Falls back to `MockLanguageModel` (returns hardcoded Counter/Form/Card component code) if `ANTHROPIC_API_KEY` is absent. The system prompt is in `src/lib/prompts/generation.tsx`.

**AI Tools** (`src/lib/tools/`)
- `str-replace.ts` — `view`, `create`, `str_replace`, `insert`, `undo_edit` commands on the virtual FS
- `file-manager.ts` — `rename`, `delete` commands

**Contexts**
- `src/lib/contexts/chat-context.tsx` — chat state via Vercel AI SDK's `useChat`
- `src/lib/contexts/file-system-context.tsx` — virtual FS state; syncs to DB on changes

**Preview** (`src/components/preview/PreviewFrame.tsx`)
Renders the virtual FS files in an iframe using Babel standalone to transform JSX to plain JS at runtime.

**Auth** (`src/lib/auth.ts`, `src/middleware.ts`)
JWT in HTTP-only cookies (7-day expiry). Middleware protects `/api/projects` and `/api/filesystem`. Projects can be anonymous (no `userId`).

### Database

SQLite via Prisma. Two models: `User` and `Project`. `Project.messages` stores chat history as JSON string; `Project.data` stores the serialized virtual file system.

### UI

- Next.js App Router with resizable three-panel layout: chat | preview | code editor
- shadcn/ui (new-york style) + Tailwind CSS v4 + Lucide icons
- Path alias `@/*` maps to `src/*`
