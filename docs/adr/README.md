# Architecture Decision Records (ADR)

This directory contains the log of major architectural decisions made for the Saree Elegance platform.

## ADR Template
```markdown
# [Title of ADR]

- **Status**: [Proposed | Accepted | Rejected | Superseded | Deprecated]
- **Date**: YYYY-MM-DD
- **Decision Makers**: [List of roles/names]

## Context
[What is the problem being solved? What are the constraints and assumptions?]

## Decision
[What is the change that we're proposing and/or doing?]

## Alternatives Considered
[What else was considered and why was it rejected?]

## Consequences
[What becomes easier or more difficult to do because of this change?]

## Risks
[What are the operational or security risks?]

## Migration Plan
[How do we transition from the old state to the new state?]

## Revisit Date
[When should this decision be evaluated again?]
```

## Initial ADRs

- **ADR-001**: Use React 19 + Vite for Frontend ([Accepted]).
- **ADR-002**: Express.js Modular Monolith ([Accepted]).
- **ADR-003**: PostgreSQL + Prisma for Persistence ([Accepted]).
- **ADR-004**: Redis for Caching and Session State ([Accepted]).
- **ADR-005**: Zustand (UI State) vs TanStack Query (Server State) ([Accepted]).
- **ADR-006**: i18next for Localization ([Accepted]).
- **ADR-007**: BullMQ for Background Jobs and Events ([Accepted]).
- **ADR-008**: JWT Access Token in Memory + HttpOnly Refresh Cookie ([Accepted]).
