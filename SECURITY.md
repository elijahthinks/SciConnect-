# Security policy

## Supported versions

Security fixes are made on the `main` branch. There are no separately maintained releases yet.

## Report a vulnerability

Don't open a public issue for security problems.

Report it privately through [GitHub security advisories](https://github.com/elijahthinks/SciConnect-/security/advisories/new). Include:

- what the problem is and which part of the app it affects
- the steps to reproduce it, or a proof of concept
- the impact you think it has, such as account takeover or data exposure

You'll get a reply within 7 days. Once the problem is confirmed, a fix will be prepared and you'll be told when it ships. With your permission, you'll be credited in `CHANGELOG.md`.

## Scope

In scope: the API in `src/backend`, the app in `src/frontend`, and the deployment files in `.build/`.

Out of scope: problems in third-party services, such as Cloudinary or OAuth providers, unless SciConnect uses them insecurely. Findings that need a compromised server or device are also out of scope.

## For contributors

- Never commit `.env` files, keys or real user data. Use `.config/env.example` for placeholders.
- Run `npm audit` in `src/backend` and `src/frontend` when you add dependencies.
