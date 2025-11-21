# Dockerfile for rcd-auth-server
FROM node:18-alpine

# Install curl for healthcheck compatibility
RUN apk add --no-cache curl
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
