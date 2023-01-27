FROM node:alpine

ADD ./chromium-x64 /opt/bin/chromium
ADD ./ffmpeg-x64 /opt/bin/ffmpeg

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/opt/bin/chromium

WORKDIR /usr/app

# Instructions from PNPM docs for using Docker - https://pnpm.io/cli/fetch
# COPY pnpm-lock.yaml ./
# RUN pnpm fetch

COPY package*.json ./
COPY tsconfig.json ./
COPY src src

RUN npm i

EXPOSE 8080

CMD ["npm", "run", "start"] 