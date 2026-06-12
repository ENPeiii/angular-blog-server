# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsoa.json ./
COPY tsconfig.json ./
COPY src ./src/
COPY public ./public/

RUN npm ci
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/public ./public

RUN npm ci --omit=dev && npx prisma generate --schema=./prisma/schema.prisma && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/server.js"]
