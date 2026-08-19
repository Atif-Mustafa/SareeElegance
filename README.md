# Saree Elegance - Enterprise E-Commerce Platform

A production-grade, enterprise-level e-commerce application for handcrafted heritage sarees.

## Project Structure

```text
client/        # Browser-only React frontend (React 19, Vite, Tailwind CSS, Zustand)
server/        # Node.js Express backend (Express, Zod, REST endpoints)
shared/        # Runtime-neutral contracts, schemas, types, and constants
tests/         # End-to-end tests (Playwright/Vitest E2E)
docs/          # Architectural documentation, guidelines, and changelog
scripts/       # Operational and automation scripts
public/        # Static public assets
prisma/        # Reserved for future database schema & migration files
```

## Development Commands

```bash
# Start Vite development server
npm run dev

# Start Express development server
npm run dev:server

# Run type checks
npm run typecheck          # Both client and server
npm run typecheck:client   # Client only
npm run typecheck:server   # Server only

# Database Commands (Prisma)
npm run db:generate        # Generate Prisma Client
npm run db:validate        # Validate Prisma Schema
npm run db:format          # Format Prisma Schema
npm run db:migrate:dev     # Run database migrations (development)
npm run db:migrate:deploy  # Deploy database migrations (production)

# Run server integration tests
npm run test:server

# Run real database integration tests
# Ensure TEST_DATABASE_URL is set in environment (NOT a production DB)
npm run test:db

# Build production bundle
npm run build
```

## Architectural Boundaries & Rules

1. **Client/Server Isolation**: Client code under `client/` MUST NEVER import server code from `server/`. Server code MUST NEVER import browser/React code.
2. **Shared Layer**: Runtime-neutral contracts, Zod schemas, error codes, and money types live in `shared/`.
3. **Database & Schema**: Database schemas (Prisma) and migrations are strictly isolated to `prisma/`. Prisma has been initialized but contains ZERO domain models (catalog, inventory, etc. are NOT implemented yet).
4. **Environment Variables**: Server configuration and secrets (like `DATABASE_URL`) are strictly isolated to the server process and are validated at startup.
