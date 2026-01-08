FROM oven/bun:debian AS base
WORKDIR /app

# Copy root workspace files
COPY ./package.json ./bun.lock ./

# Copy workspace packages
COPY ./wire ./wire
COPY ./backend ./backend
COPY ./web/package.json ./web/package.json

FROM base AS deps
RUN bun ci --filter=backend

FROM deps AS build
RUN cd backend && bun build --target=bun src/index.ts --outfile=index.js

FROM oven/bun:slim
WORKDIR /app

COPY --from=build /app/backend/index.js .

EXPOSE 3000

CMD ["bun", "/app/index.js"]