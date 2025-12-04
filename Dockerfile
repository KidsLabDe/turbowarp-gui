# Stage 1: Build
FROM node:16-alpine AS builder
WORKDIR /app

# Copy all source files first (npm ci runs prepublish which needs scripts/)
COPY . .

# Install dependencies (prepublish script will run automatically)
RUN npm ci

# Build arguments (injected at build time via webpack DefinePlugin)
ARG BACKEND_URL=https://localhost:8080
ARG ROUTING_STYLE=wildcard
ARG ROOT=/
ENV BACKEND_URL=${BACKEND_URL}
ENV ROUTING_STYLE=${ROUTING_STYLE}
ENV ROOT=${ROOT}

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
