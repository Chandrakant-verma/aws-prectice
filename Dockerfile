FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY server/package*.json ./

RUN npm ci --omit=dev

COPY server/ .

EXPOSE 5000

CMD ["node", "src/server.js"]