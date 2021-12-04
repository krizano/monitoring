FROM node:14 as base
RUN mkdir -p /home/node/monitor/app
WORKDIR /home/node/monitor
COPY package*.json ./
RUN npm i
COPY . .

FROM base as production
RUN npm run build
