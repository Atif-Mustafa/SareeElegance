# Shared Contracts

This directory contains runtime-neutral contracts shared between the `client` (React browser environment) and `server` (Node.js Express environment).

## Rules

- **Allowed**: Types, Zod schemas, simple constants (like Error Codes).
- **Forbidden**: React imports, Express imports, Node APIs, browser globals, Prisma client or generated types.

## Contents

- `contracts/api`: Shared API Envelopes (`ApiSuccess`, `ApiProblem`, `ApiPaginatedSuccess`, `PaginationInput`, `PaginationMeta`).
- `contracts/money`: Canonical representation of Money and Currency. Uses `amountMinor` (integer string) to avoid floating point limitations.
- `contracts/ids`: Unique identifiers (`EntityId`, `RequestId`).
- `errors`: Shared error codes catalog (`ERROR_CODES`).
- `schemas`: Zod schemas executable on both client and server (e.g. `MoneySchema`).
- `types`: Basic types like `IsoTimestamp`.

## Database Boundary

**Important**: Shared types must never import from `@prisma/client`.
The flow must be:
Prisma Model -> Server Service -> Shared DTO -> Client.
