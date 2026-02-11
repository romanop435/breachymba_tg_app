FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build
RUN chmod +x entrypoint.sh

EXPOSE 3001
CMD ["./entrypoint.sh"]
