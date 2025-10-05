# ---- build stage ----
    FROM node:22-alpine AS build
    ARG CACHE_BUSTER=1
    WORKDIR /app
    
    # Install minimal build tools if any native modules require compilation (uncomment if needed)
    # RUN apk add --no-cache make g++ python3
    
    # Copy package files first for caching
    COPY frontend/package*.json ./
    
    # Use npm ci to install all dependencies (including devDeps required for build like tsc, vite)
    RUN npm ci --silent
    
    # Copy the rest of the frontend source into /app
    # This must include: src/, public/, index.html, tsconfig.json, vite.config.(js|ts), etc.
    COPY frontend/ .
    
    # Build the app (this runs tsc and vite build as in your package.json)
    RUN npm run build

    RUN ls -la dist  # ✅ debug check
    
    # ---- production stage ----
    FROM nginx:1.25-alpine AS production
    
    # Remove default nginx html if present (optional)
    RUN rm -rf /usr/share/nginx/html/*
    
    # Copy built assets from build stage
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Copy nginx config (adjust path if nginx.conf location differs)
    COPY frontend/nginx.conf /etc/nginx/nginx.conf

    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]