FROM node:alpine

# ADD ./chromium-x64 /opt/bin/chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/opt/bin/chromium

WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig.json ./
COPY src src

RUN npm i

EXPOSE 8080

CMD ["npm", "run", "start"] 