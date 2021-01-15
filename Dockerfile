FROM node:12.20.1-alpine3.10

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm i -g @adonisjs/cli nodemon

EXPOSE 3333
EXPOSE 5432
