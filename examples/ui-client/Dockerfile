FROM node:lts-slim

RUN mkdir -p /code

WORKDIR /code
COPY . .
RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]