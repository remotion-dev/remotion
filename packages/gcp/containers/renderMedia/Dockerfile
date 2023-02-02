FROM node:alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    ffmpeg \
    font-noto-emoji

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/app

COPY package*.json ./
COPY dist ./dist

RUN npm i

EXPOSE 8080

CMD ["npm", "run", "start"]