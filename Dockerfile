# ─────────────────────────────────────────────────────────────────────────────
# PDF Merge — multi-stage Docker build
#
# Stage 1 (deps)    – install all npm dependencies (dev + prod)
# Stage 2 (builder) – run `next build` and produce .next/standalone
# Stage 3 (runner)  – minimal production image, PM2 cluster mode
#
# PDF Merge is entirely client-side (no database, no server-side file
# processing), so the only build-time variable is the canonical site URL
# used for metadata/Open Graph tags.
#
# Build:
#   docker build \
#     --build-arg NEXT_PUBLIC_APP_URL=https://yourdomain.com \
#     -t pdfcraft:latest .
#
# Run:
#   docker run -p 3004:3004 pdfcraft:latest
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:24-alpine AS deps

# libc6-compat is required by some native Node modules on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy manifests first for layer caching.
COPY package.json package-lock.json* ./

# Install all dependencies (devDependencies needed for the build stage).
# --ignore-scripts: this stage only produces node_modules for the builder
# stage to copy — the "postinstall" hook (copies the pdfjs worker into
# public/) is run explicitly in the builder stage instead, since `COPY . .`
# there pulls public/ fresh from the build context and would otherwise
# discard whatever postinstall produced here.
RUN npm ci --ignore-scripts

# ── Stage 2: build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Bring in installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source tree
COPY . .

# See the --ignore-scripts note above.
RUN node scripts/copy-pdf-worker.mjs

# ─── NEXT_PUBLIC_* vars are embedded at build time ───────────────────────────
# Pass them via --build-arg. They CANNOT be changed at runtime.
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Suppress Next.js build telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# PM2 state directory — must be writable by the non-root nextjs user
ENV PM2_HOME=/tmp/.pm2

# Install PM2 process manager (runs as root before user switch)
RUN npm install -g pm2@latest --no-fund --no-audit

# Dedicated non-root user/group + PM2 home directory
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs \
 && mkdir -p /tmp/.pm2 \
 && chown -R nextjs:nodejs /tmp/.pm2

# /app/public — static files served by Next.js
COPY --from=builder /app/public ./public

# Pre-create .next so chown works before copying into it
RUN mkdir -p .next && chown nextjs:nodejs .next

# Standalone server bundle — contains server.js + minimal node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Static client assets (JS/CSS chunks, images)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# PM2 ecosystem config
COPY --chown=nextjs:nodejs ecosystem.config.js ./

USER nextjs

EXPOSE 3004

ENV PORT=3004
ENV HOSTNAME="0.0.0.0"

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
