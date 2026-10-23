# Tests

`integration/` holds scripts that call a running API, covering chat, comments, posts, research features, search and online status.

Start the API first:

```bash
cd src/backend && npm run dev
```

Then run a script from the repository root. The scripts use the back end's dependencies, so point Node at them:

```bash
NODE_PATH=src/backend/node_modules node test/integration/test-research-features.js
```
