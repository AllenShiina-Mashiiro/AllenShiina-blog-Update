# Rebuild scope

This is a clean implementation, not a forked runtime of the legacy application.

## Product areas to preserve

- Public home, category archives (study notes, resources, life, articles), search, article detail, about page.
- Markdown publishing, editing, deletion, drafts, publish/update timestamps, code highlighting and image galleries.
- User profiles, avatar/cover customization, profile links, bookmarks/pins, likes, comments and threaded replies.
- Notifications, announcements, admin moderation, user management and site appearance controls.
- Visitor read access and authenticated interaction.

## Account rules

- Public handle: lowercase ASCII letters, digits and underscores only; users do not enter the @ prefix.
- Public display form: @handle. Internal identity remains a UUID.
- Email registration verification is a short-lived one-time code. No magic-link login.
- Google and GitHub OAuth are optional providers and must link accounts only after provider email verification.
- Verification codes must be hashed at rest, expire, be single-use, and enforce resend/attempt limits.

## Deployment gates

1. Typecheck, lint, Prisma schema validation and production build.
2. Windows Docker Compose startup, migration, registration and content smoke tests.
3. Ubuntu VM Docker Compose + Nginx reverse-proxy smoke tests.
4. Only then open a reviewed PR from v1.0.1-dev into master.
