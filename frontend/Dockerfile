# Step 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Install package dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and compile Vite production build
COPY . .
RUN npm run build

# Step 2: Serve compiled assets using Nginx
FROM nginx:stable-alpine

# Copy custom Nginx configuration to support client-side React routing if needed
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
