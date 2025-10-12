# ---- Build Stage ----
    FROM node:18 AS build
    WORKDIR /app
    
    COPY frontend/package*.json ./
    RUN npm ci
    
    COPY frontend/ ./
    RUN npm run build
    
    # ---- Production Stage ----
    FROM nginx:stable-alpine AS production
    
    # Clean old html
    RUN rm -rf /usr/share/nginx/html/*
    
    # Copy built files from builder stage
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Copy nginx config
    COPY frontend/nginx.conf /etc/nginx/nginx.conf
    
    # Expose port 80
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]