# Direcon Junior Developer Task - Backend / Server

## Project setup

Used Docker and docker-compose for database-server connectivity & ease.

To start development server:

```sh
# install dependencies
npm install

# copy/rename .env.example to .env and edit if you changed any value
cp .env.example .env

# build containers
docker-compose build

# spin them up
docker-compose up

# run migrations
# if you changed server image's name, edit before using this
docker exec -it $(docker ps | grep direcon-junior-db-server | awk '{ print $1}') npm run migrate

```
