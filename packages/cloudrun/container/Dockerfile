FROM debian:bookworm-20230411

RUN apt-get update
RUN apt-get install -y nodejs npm chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /usr/app

COPY package*.json ./
RUN npm i

COPY dist ./dist

EXPOSE 8080

CMD ["npm", "run", "start"]
