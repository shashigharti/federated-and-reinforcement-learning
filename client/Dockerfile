FROM node:16.14.0

RUN mkdir -p /code

WORKDIR /code
COPY . .
RUN npm install

EXPOSE 3000
RUN export NODE_OPTIONS=--openssl-legacy-provider

CMD [ "npm", "start" ]