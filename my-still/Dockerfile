# This is a dockerized version of a server that you can easily deploy somewhere.
# If you don't want server rendering, you can safely delete this file.

FROM node:22-bookworm-slim

RUN apt install -y \
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
  libcups2

RUN mkdir app
COPY . ./app

WORKDIR /app

RUN npm i

# Run everything after as non-privileged user.
USER pptruser

EXPOSE 8000

CMD ["npm", "run", "server"] 
