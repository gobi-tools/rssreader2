# syntax=docker/dockerfile:1

########## Build stage ##########
FROM node:24-bookworm AS build

# Native toolchain in case better-sqlite3 has to be compiled from source
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Build: tsc -> dist/, react-srv bundle -> public/hydrate, res -> public/
COPY tsconfig.json ./
COPY src ./src
COPY res ./res
RUN npm run build \
 && npm prune --omit=dev

########## Runtime stage ##########
FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
# react-srv needs the source tree at runtime: render() searches srcPath to
# compute the hashed hydration script filenames (e.g. Home.<hash>.js)
COPY --from=build /app/src ./src
COPY drizzle ./drizzle
# Migration runner (drizzle-kit is a devDependency, so the image ships
# its own runner built on drizzle-orm). Not run automatically — invoke
# manually: docker compose exec app node scripts/migrate.mjs
COPY scripts ./scripts

# The sqlite database is expected at /app/data (bind-mounted from the host)
ENV DATABASE_URL=/app/data/app.sqlite
RUN mkdir -p /app/data

EXPOSE 3000

# Start the server. No automatic migrations — the existing database is used as-is.
CMD ["node", "dist/server.js"]
