FROM alexanderkarpov/alpine-mystem-node:latest

WORKDIR /app

COPY . /app

CMD ["npm", "run", "container:start"]
