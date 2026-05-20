# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Development environment
FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 3: Builder stage for production
FROM base AS builder
RUN npm run build

# Stage 4: Production serving via Nginx
FROM nginx:1.25-alpine AS production
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
# Custom Nginx configuration to support SPA routing (fallback to index.html) and reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
