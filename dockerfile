# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com/ --global
RUN npm install
# RUN npm install --loglevel verbose --no-cache
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Copy custom nginx configuration
COPY .deployments/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
