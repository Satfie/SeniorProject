FROM node:18-alpine

# Install curl for healthcheck compatibility
RUN apk add --no-cache curl
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
