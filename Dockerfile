# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- serve stage ---
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY docker/Caddyfile /etc/caddy/Caddyfile
