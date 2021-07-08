FROM node:14.17-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i -g npm && npm install

COPY . .

CMD ["npm", "run", "dev"]

EXPOSE 3333
