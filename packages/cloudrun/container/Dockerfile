FROM node:20-bookworm

RUN apt-get update
RUN apt-get install -y chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /usr/app

COPY package*.json ./
RUN npm i

COPY dist ./dist

EXPOSE 8080

CMD ["npm", "run", "start"]
