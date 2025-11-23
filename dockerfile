# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm","start"]