# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
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

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
