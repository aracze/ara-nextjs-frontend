# syntax=docker.io/docker/dockerfile:1

FROM node:24-alpine AS base
# libc6-compat bývá potřeba pro některé nativní moduly na Alpine.
RUN apk add --no-cache libc6-compat

# Instalace závislostí (pnpm — projekt používá pnpm-lock.yaml, ne npm)
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Sestavení
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# URL na CMS pro build-time generování vyhledávacího indexu.
# Když CMS není dostupné, vygeneruje se prázdný index a build nespadne
# (viz src/scripts/generate-search-index.ts).
ARG PAYLOAD_BASE_API_URL
ENV PAYLOAD_BASE_API_URL=${PAYLOAD_BASE_API_URL}

RUN corepack enable pnpm \
  && pnpm run generate-search-index \
  && pnpm run build

# Ať runner stage bezpečně zkopíruje public i kdyby ve zdrojích chyběl.
RUN mkdir -p public

# Produkční obraz — jen spuštění hotového standalone outputu
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Správná práva pro prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Standalone output (server.js) — výrazně menší obraz
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js vytváří `next build` ze standalone outputu
CMD ["node", "server.js"]
