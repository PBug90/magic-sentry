# syntax=docker/dockerfile:1.7
# ---------- builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Workspace package.json files needed for `npm ci` to resolve workspace links.
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY viewer/package.json ./viewer/
COPY web/package.json ./web/
COPY twitch-extension/package.json ./twitch-extension/

RUN npm ci

# Source needed to build the web service.
COPY shared ./shared
COPY viewer ./viewer
COPY web ./web
COPY assets ./assets

# VITE_EXTENSION_URL is inlined by Vite at build time, not read at runtime.
ARG VITE_EXTENSION_URL=""
ENV VITE_EXTENSION_URL=$VITE_EXTENSION_URL

RUN npm -w magic-sentry-web run build

# ---------- runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# tini is PID 1 so SIGTERM/SIGINT propagate to node — clean shutdowns on docker stop.
RUN apk add --no-cache tini

# Lockfile + workspace manifests for the prod install.
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/viewer/package.json ./viewer/
COPY --from=builder /app/twitch-extension/package.json ./twitch-extension/
COPY --from=builder /app/web/package.json ./web/

# Built artifacts.
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/web/dist ./web/dist

# Production-only install across the workspace tree.
RUN npm ci --omit=dev

# Drop privileges — the `node` user exists in node:22-alpine by default.
RUN chown -R node:node /app
USER node

WORKDIR /app/web
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server/index.js"]
