FROM alexanderkarpov/alpine-mystem-node:latest

WORKDIR /app

COPY . /app

ENV NODE_ENV=production
CMD ["npm", "run", "container:start"]
