FROM node:19.7.0-alpine3.17

#ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --omit=dev

COPY . .

ENV IP=0.0.0.0 PORT=80
EXPOSE 80

CMD [ "node", "server.js" ]
