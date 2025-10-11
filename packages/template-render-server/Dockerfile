FROM node:lts-bookworm


# Install dependencies required for chromium
RUN apt-get update && apt-get install -y \
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


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p renders

# Install browser
RUN npx remotion browser ensure

# Bundle the Remotion composition
RUN npx remotion bundle
# By default, bundle command will create "build" directory with the bundle
ENV REMOTION_SERVE_URL=build

ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
