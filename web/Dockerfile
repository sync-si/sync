# Install Deps

FROM oven/bun:1.2.23-alpine AS build

WORKDIR /app

COPY ./package.json ./bun.lock ./

RUN bun ci

COPY ./ ./

# Build vue app

FROM build AS build-app

RUN bun run build

# Build Histoire

FROM node:24-alpine3.22 AS build-histoire

WORKDIR /app

COPY --from=build /app /app

RUN npm run story:build

# Web Entrypoint:

FROM nginx:alpine AS serve-web

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-app /app/dist /usr/share/nginx/html

# Histoire Entrypoint:

FROM nginx:alpine AS serve-histoire

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-histoire /app/.histoire/dist/ /usr/share/nginx/html
