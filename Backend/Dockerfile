FROM node:18-alpine

WORKDIR /app

# install deps
COPY package.json package-lock.json* ./
RUN npm install --production --silent || true

# copy source
COPY . .

ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]
