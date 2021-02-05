FROM node:12.20.1-alpine3.10

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --silent

COPY . .

RUN npm install pm2 -g --silent

RUN npm i -g @adonisjs/cli --silent

EXPOSE 3333
EXPOSE 5432
