# Contributing to SciConnect

Thanks for helping. This guide covers how to set up the project, what a good pull request looks like, and where things live.

## Set up

1. Fork the repository and clone your fork.
2. Install dependencies and create an environment file:
   ```bash
   cd src/backend
   npm run install:all
   cp ../../.config/env.example .env
   ```
   For local work, set `NODE_ENV=development` in `.env`. SQLite is used automatically, so you don't need PostgreSQL or Redis to get started.
3. Start the API and the app together:
   ```bash
   npm run dev:full
   ```

## Make a change

- Create a branch from `main` with a short, descriptive name, such as `fix-fact-check-sources`.
- Keep each pull request to one change. Small pull requests get reviewed faster.
- Put back-end code in `src/backend`, front-end code in `src/frontend`, and integration scripts in `test/`.
- If you change the database schema, add a migration in `src/backend/src/migrations`.
- If you add an environment variable, add it to `.config/env.example` with a safe placeholder.
- Update `CHANGELOG.md` under **Unreleased** for anything users will notice.

## Before you open a pull request

```bash
cd src/frontend && npm run lint && npm run build
cd ../backend && npm start      # then check http://localhost:3000/api/health
```

The integration scripts in `test/integration` call a running API. Start the server first, then follow [test/README.md](test/README.md).

## Commit messages

Write the summary line in the imperative, and keep it under 72 characters: "Add source links to fact checks", not "Added sources". Use the body to explain why the change is needed.

## Reviews

`CODEOWNERS` requests reviewers automatically. A maintainer may ask for changes. Push new commits to the same branch rather than opening a new pull request.

## Reporting bugs and ideas

Use the [issue forms](https://github.com/elijahthinks/SciConnect-/issues/new/choose). For security problems, follow [SECURITY.md](SECURITY.md) instead.
