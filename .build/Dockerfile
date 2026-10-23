# Build from the repository root:
#   docker build -f .build/Dockerfile -t sciconnect .

FROM node:20-alpine AS frontend
WORKDIR /app/src/frontend
COPY src/frontend/package*.json ./
RUN npm ci
COPY src/frontend/ ./
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app/src/backend
COPY src/backend/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --legacy-peer-deps
COPY src/backend/ ./
COPY --from=frontend /app/src/frontend/dist /app/src/frontend/dist
EXPOSE 3000
HEALTHCHECK CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]
