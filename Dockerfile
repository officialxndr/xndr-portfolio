# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Native module build tools (required by better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_ vars are baked into the frontend bundle at build time
ARG VITE_SITE_NAME
ARG VITE_TAGLINE
ENV VITE_SITE_NAME=$VITE_SITE_NAME
ENV VITE_TAGLINE=$VITE_TAGLINE

RUN npm run build && npm prune --omit=dev

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Copy compiled node_modules (includes native better-sqlite3 binary)
COPY --from=build /app/node_modules ./node_modules
# Copy built frontend
COPY --from=build /app/dist ./dist
# Copy server source
COPY server/ ./server/
COPY package.json ./

# Ensure persistent-data directories exist (overridden by volumes at runtime)
RUN mkdir -p public/uploads data

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "server/index.js"]
