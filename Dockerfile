FROM node:14 as base
WORKDIR /home/node/monitor
COPY package*.json ./
RUN npm i
COPY . .

FROM base as production
RUN npm run build
