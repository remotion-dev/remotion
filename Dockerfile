FROM node:alpine

# RUN curl -f https://get.pnpm.io/v7.7.1.js | node - add --global pnpm
ARG PNPM_VERSION=7.7.1
RUN npm --no-update-notifier --no-fund --global install pnpm@${PNPM_VERSION}

ADD ./packages/gcp/chromium-x64 /opt/bin/chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/opt/bin/chromium

WORKDIR /usr/app

# Instructions from PNPM docs for using Docker - https://pnpm.io/cli/fetch
COPY pnpm-lock.yaml ./
COPY .npmrc ./
# RUN pnpm --filter @remotion/gcp fetch
RUN pnpm --filter @remotion/gcp fetch

COPY ./packages/gcp/package*.json ./
COPY ./packages/gcp/tsconfig.json ./
COPY ./packages/gcp/src src

# RUN pnpm --filter @remotion/gcp i && pnpm --filter @remotion/gcp build
RUN pnpm i && pnpm build
# RUN npm i

EXPOSE 8080

CMD ["pnpm", "run", "start"] 
# CMD ["npm", "run", "start"] 