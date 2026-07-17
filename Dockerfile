# Build the client [dist folder]
# Copy the dist folder content into server/public

FROM node:20-alpine AS client-builder

WORKDIR /app

COPY client/package*.json ./
RUN npm ci

COPY client/ ./

# Vite bakes VITE_API_URL into the JS bundle at build time. The server
# serves the client from the same origin, so a relative path works and
# needs no CORS handling in the browser.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Build the server
FROM node:20-alpine

# git      -> simple-git shells out to the real git binary to clone repos
# python3/make/g++ -> bcrypt is a native module compiled during npm install
RUN apk add --no-cache git python3 make g++

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./

COPY --from=client-builder /app/dist ./public

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
