# Configuration

`env.example` lists every environment variable the API reads. Copy it to `src/backend/.env` and fill it in:

```bash
cp .config/env.example src/backend/.env
```

The template is set up for production. For local development, set `NODE_ENV=development`. The API then uses SQLite, so PostgreSQL, Redis and Cloudinary are optional.

Never commit a filled-in `.env`; it's in `.gitignore`.
