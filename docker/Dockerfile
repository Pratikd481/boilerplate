FROM node:20-alpine

WORKDIR /app

# Copy dependency files first (layer caching)
COPY package*.json ./

RUN npm ci

# Copy rest of the source
COPY . .

# Build NestJS
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
