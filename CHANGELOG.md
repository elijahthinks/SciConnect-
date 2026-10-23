# Changelog

Notable changes to SciConnect. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Removed
- Sign-up, sign-in, password reset and Google/Facebook sign-in. Everyone uses SciConnect as a shared guest account, which the API creates automatically.

### Added
- Demo mode: when no API is reachable (for example on Vercel), the app shows built-in example researchers, posts, research, fact checks, groups and messages. Example posts are labelled "Mock post". Changes last until the page is reloaded. The data lives in `src/frontend/src/demo/data.js`.

### Changed
- Reorganized the repository: application code lives in `src/backend` and `src/frontend`, integration tests in `test/`, deployment files in `.build/`, the environment template in `.config/`, and guides in `docs/`.
- The API now serves the front-end build from `src/frontend/dist`. It previously looked in a path that no longer existed.
- PM2 and the deploy script point at the new layout.
- Vercel builds the front end from `src/frontend` (configured in `vercel.json`).

### Added
- README, license, contributing guide, code of conduct, security policy, CODEOWNERS and `.gitattributes`.
- GitHub Actions for lint, build and tests; issue forms and a pull request template.
- Dockerfile and docker-compose setup in `.build/`.
- Logo, README banner and a project page in `docs/`.

## 2025-07-22
### Changed
- Split the project into `backend` and `frontend` folders.

## 2025-07-21
### Added
- Security middleware, structured logging, PM2 configuration, health checks, deployment script and production guide.

## 2025-07-20
### Added
- Research posts, fact checks and collaboration requests.
- Science-themed design system and responsive layout.

## 2025-07-15
### Added
- Group chat, online status, open access profiles and stronger authentication.
### Removed
- Vercel deployment configuration, after trying it out.

## 2025-07-11
### Added
- First version: React front end and Node.js back end.
