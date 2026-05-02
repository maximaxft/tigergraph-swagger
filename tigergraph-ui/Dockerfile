# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY ./frontend/package*.json ./
RUN npm install

COPY ./frontend ./

# VITE_API_BASE_URL is read from .env automatically by Vite during build
RUN npm run build:docker

# ── Stage 2: serve ────────────────────────────────────────────────────────────
FROM nginx:stable-alpine
RUN apk upgrade --no-cache
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
