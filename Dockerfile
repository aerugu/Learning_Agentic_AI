# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV WRANGLER_LOG_PATH=.wrangler/wrangler.log

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
COPY . .
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY --from=build /app ./
EXPOSE 3000
CMD ["pnpm", "run", "start", "--", "--host", "0.0.0.0", "--port", "3000"]
