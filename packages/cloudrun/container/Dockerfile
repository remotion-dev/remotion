FROM debian:bookworm-20230411

RUN apt-get update
RUN apt-get install -y nodejs npm chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Fix for https://github.com/remotion-dev/remotion/issues/2751
RUN mkdir -p /var/run/dbus && dbus-daemon --config-file=/usr/share/dbus-1/system.conf --print-address

WORKDIR /usr/app

COPY package*.json ./
RUN npm i

COPY dist ./dist

EXPOSE 8080

CMD ["npm", "run", "start"]
