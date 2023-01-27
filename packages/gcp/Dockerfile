FROM node:alpine

ADD ./packages/gcp/chromium-x64 /opt/bin/chromium

ARG PNPM_VERSION=7.7.1
RUN npm --no-update-notifier --no-fund --global install pnpm@${PNPM_VERSION}

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/opt/bin/chromium

WORKDIR /root/monorepo
COPY . .

RUN pnpm install --filter "@remotion/gcp..."
# RUN pnpm build --filter "@remotion/gcp..."

WORKDIR /root/monorepo/packages/gcp

EXPOSE 8080

CMD ["pnpm", "run", "start"] 
# CMD ["npm", "run", "start"] 