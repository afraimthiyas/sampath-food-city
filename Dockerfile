# ---------- Build stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Production dependencies stage ----------
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ---------- Runtime stage ----------
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Run as a non-root user (AWS/ECS best practice)
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

USER nestjs

EXPOSE 3000

# Used by ECS/ALB health checks
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"

CMD ["node", "dist/main.js"]
