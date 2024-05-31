FROM node:20-bookworm

RUN apt-get update
RUN apt-get install -y chromium fonts-noto-color-emoji

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /usr/app

COPY package*.json ./
RUN npm config set update-notifier false
RUN npm i --no-fund --no-audit

COPY dist ./dist

EXPOSE 8080

CMD ["npm", "run", "start"]
