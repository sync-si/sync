FROM oven/bun:debian AS base
WORKDIR /app

COPY ./package.json ./bun.lock ./

FROM base AS deps
RUN bun i

FROM deps AS build

COPY ./ ./

RUN bun build --target=bun src/index.ts --outfile=index.js

FROM oven/bun:slim
WORKDIR /app

COPY --from=build /app/index.js .

EXPOSE 3000

CMD ["bun", "/app/index.js"]