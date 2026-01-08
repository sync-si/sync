# Install Deps

FROM oven/bun:1.2.23-alpine AS build

WORKDIR /app

# Copy root workspace files
COPY ./package.json ./bun.lock ./

# Copy workspace packages
COPY ./wire ./wire
COPY ./web ./web
COPY ./backend/package.json ./backend/package.json

RUN bun ci --filter=sync3-web

# Build vue app

FROM build AS build-app

RUN cd web && bun run build

# Build Histoire

FROM node:24-alpine3.22 AS build-histoire

WORKDIR /app

COPY --from=build /app /app

RUN cd web && npm run story:build

# Web Entrypoint:

FROM nginx:alpine AS serve-web

COPY ./web/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-app /app/web/dist /usr/share/nginx/html

# Histoire Entrypoint:

FROM nginx:alpine AS serve-histoire

COPY ./web/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-histoire /app/web/.histoire/dist/ /usr/share/nginx/html
