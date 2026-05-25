# ============================================================
# LinkSee Web Frontend — React/Vite + Nginx Dockerfile
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy workspace root config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all workspace packages (needed for monorepo build)
COPY packages/ packages/
COPY apps/web/ apps/web/

# Install all dependencies and build
RUN pnpm install --frozen-lockfile \
    && pnpm --filter ./packages/** build \
    && pnpm --filter @linksee/web build

# --- Runtime stage ---
FROM nginx:1.27-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /build/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1
