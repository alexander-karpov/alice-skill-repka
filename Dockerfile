FROM alexanderkarpov/alpine-mystem-node:latest

WORKDIR /app

COPY . /app

CMD ["node", "/app/index.js"]
