FROM node:20.3.0-alpine3.18

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY ecosystem.config.js .
COPY type.d.ts .
COPY .env .
COPY ./src ./src

RUN apk add python3
RUN npm install pm2 -g
RUN npm install
RUN npm run build

EXPOSE 3030

CMD ["pm2-runtime","start","ecosystem.config.js"]