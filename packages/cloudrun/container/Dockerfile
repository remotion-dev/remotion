FROM node:22-bookworm-slim

WORKDIR /usr/app

COPY package.json ./
COPY ensure-browser.mjs ./
COPY ensure.mjs ./

RUN node /usr/app/ensure.mjs

RUN apt update
RUN apt install -y \
  git \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libatk-bridge2.0-0 \
  libpango-1.0-0 \
  libcairo2 \
  libcups2

RUN npm config set update-notifier false
RUN npm i --no-fund --no-audit

COPY dist ./dist

EXPOSE 8080

CMD ["npm", "run", "start"]
