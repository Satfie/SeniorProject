FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Build production Next.js output
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
