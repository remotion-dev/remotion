FROM node:alpine

RUN curl -f https://get.pnpm.io/v7.7.1.js | node - add --global pnpm

ADD ./chromium-x64 /opt/bin/chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/opt/bin/chromium

WORKDIR /usr/app

# Instructions from PNPM docs for using Docker - https://pnpm.io/cli/fetch
# COPY pnpm-lock.yaml ./
# RUN pnpm fetch

COPY package*.json ./
COPY tsconfig.json ./
COPY src src

# RUN pnpm i
RUN npm i

EXPOSE 8080

# CMD ["pnpm", "run", "start"] 
CMD ["npm", "run", "start"] 