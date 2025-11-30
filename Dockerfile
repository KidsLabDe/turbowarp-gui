# Stage 1: Build
FROM node:16-alpine AS builder
WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files
COPY . .

# Build argument for backend URL (injected at build time via webpack DefinePlugin)
ARG BACKEND_URL=https://localhost:8080
ENV BACKEND_URL=${BACKEND_URL}

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS runner

# Copy built files to nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
