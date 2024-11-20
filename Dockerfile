FROM node:18

WORKDIR /app

COPY package.json ./

RUN npm install axios

COPY main.js ./
COPY config.json ./

CMD ["node", "main.js"]
