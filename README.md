# AllenShiina Blog Update

Independent rebuild of the NEXUS personal blog.

## Target stack

- React + Next.js (App Router) + TypeScript
- PostgreSQL 18 + Prisma ORM
- Docker / Docker Compose for local and Linux deployment
- Nginx reverse proxy for Ubuntu/server deployment

## Development rules

- This repository is independent from the original `AllenShiina-nexus-blog` repository.
- Do not add Supabase, legacy JSON stores, or legacy local database files as runtime dependencies.
- Preserve the original site's user-facing features while rebuilding the implementation.
- Email registration and verification use one-time codes, not magic-link sign-in.
- Public handles use lowercase letters, digits, and underscores; display them with an `@` prefix.

## Branch plan

- `master`: verified stable releases
- `v1.0.1-dev`: active rebuild and integration branch

The rebuild is not considered complete until Windows local deployment and Ubuntu VM deployment have both been verified.
