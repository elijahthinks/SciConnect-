<p align="center">
  <img src="assets/banner.svg" alt="SciConnect: share work in progress, check claims, find collaborators." width="100%">
</p>

SciConnect is an open-source social network for scientists. Share research while it's still in progress, attach fact checks to claims, and find people to work with.

- **Research posts** with tags, links and attachments
- **Fact checks** that mark a claim as supported, disputed or still open
- **Collaboration requests** that say what help a project needs
- **Groups and direct messages** in real time, with media and online status
- **Open profiles** listing skills, side projects and affiliations

The front end is React with Vite and Tailwind. The API is Express with Sequelize and Socket.IO, running on SQLite locally and PostgreSQL in production.

## Run it locally

You need Node.js 18 or newer.

```bash
git clone https://github.com/elijahthinks/SciConnect-.git
cd SciConnect-/src/backend
npm run install:all                      # installs back end and front end
cp ../../.config/env.example .env        # set NODE_ENV=development and fill in secrets
npm run dev:full                         # API on :3000, app on :5173
```

To deploy, follow the [production guide](docs/production.md). You can also build the container in [`.build/`](.build/).

## Repository layout

```
SciConnect-/
├── .github/                  CI workflows, issue forms, pull request template
│   ├── workflows/            build.yml (lint + build), test.yml (back-end tests)
│   ├── ISSUE_TEMPLATE/       Bug report and feature request forms
│   └── PULL_REQUEST_TEMPLATE.md
├── .build/                   Dockerfile, docker-compose, PM2 config, deploy script
├── .config/                  Environment template (env.example)
├── assets/                   Logo and README banner
├── docs/                     Setup, production and feature guides; project page
├── src/
│   ├── backend/              Express API: models, routes, migrations, sockets
│   └── frontend/             React app: pages, components, stores
├── test/                     Integration scripts that run against a live API
├── .gitattributes            Line endings and binary file handling
├── .gitignore
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── CODEOWNERS
├── LICENSE
├── README.md
└── SECURITY.md
```

## Documentation

- [Setup with PostgreSQL and Redis](docs/setup.md)
- [PostgreSQL quick start](docs/postgres-quickstart.md)
- [Production deployment](docs/production.md)
- Feature notes: [chat](docs/backend/chat.md), [online status](docs/backend/online-status.md), [research features](docs/backend/research-features.md), [open access profiles](docs/backend/open-access-features.md)
- [Project page](docs/index.html), which can be published with GitHub Pages from `/docs`

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before you open a pull request, and follow the [code of conduct](CODE_OF_CONDUCT.md). To report a vulnerability, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## License

[MIT](LICENSE)
