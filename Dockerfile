# Simple single-stage build for reliability
FROM node:18-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install all deps (including dev for build)
COPY package*.json ./
RUN npm install

# Copy source and Prisma schema
COPY prisma ./prisma/
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Generate Prisma Client and build TypeScript
RUN npx prisma generate && npx tsc --project tsconfig.build.json

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "dist/main.js"]
