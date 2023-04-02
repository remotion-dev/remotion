---
image: /generated/articles-docs-docker.png
id: docker
title: Dockerizing a Remotion app
crumb: "Building video apps"
---
We recommend the following structure for your Dockerfile. Read below about the individual steps and whether you need to adjust them.

```docker title="Dockerfile"
FROM debian:bookworm

# Install necessary packages
RUN echo "deb http://deb.debian.org/debian bookworm main contrib non-free" > /etc/apt/sources.list

RUN apt-get update
RUN apt-get install -y wget
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb
RUN apt-get install -y nodejs npm ffmpeg

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"

# Copy everything from your project to the docker image. Adjust if needed.
COPY package.json package*.json yarn.lock* pnpm-lock.yaml* tsconfig.json* remotion.config.* ./
COPY src ./src
COPY public ./public

# Install the right package manager and dependencies - see below for Yarn/PNPM
RUN npm i

# Run your application
COPY render.mjs render.mjs
CMD ["node", "render.mjs"]
```

## Line-by-line

<p>
<Step>1</Step> Specify the base image for the Dockerfile. In this case, it is using the latest version of Debian called 'bookworm'.
</p>

```docker
FROM debian:bookworm
```

<p>
<Step>2</Step> Add a new repository to the sources.list file, which is required to install Google Chrome.
</p>

```docker
RUN echo "deb http://deb.debian.org/debian bookworm main contrib non-free" > /etc/apt/sources.list
```

<p>
<Step>3</Step> Update the package lists on the Debian system.
</p>

```docker
RUN apt-get update
```

<p>
<Step>4</Step> Install the wget package which is used to download files from the internet.
</p>

```docker
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
```

<p>
<Step>5</Step> Download and install the Google Chrome stable release package.
</p>

```docker
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb
```

<p>
<Step>6</Step> Installs Node.js, npm (Node package manager), and FFmpeg.
</p>

```docker
RUN apt-get install -y nodejs npm ffmpeg
```

<p>
<Step>7</Step> An environment variable named PUPPETEER_SKIP_CHROMIUM_DOWNLOAD is established with a value of true, which stops Puppeteer from downloading a separate instance of Chromium. Additionally, an environment variable named CHROME_EXECUTABLE_PATH is defined with the path of the installed Google Chrome in the Docker container.
</p>

```docker
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
```

<p>
<Step>8</Step> Copy the files from your project. If you have additional source files, add them here. If some files do not exist, remove them.
The COPY syntax allows multiple files, but at least one file must exist. It is assumed package.json, src and public exist in your project, but you can adjust this to your needs.
</p>

```docker
COPY package.json package*.json yarn.lock* pnpm-lock.yaml* tsconfig.json* remotion.config.* ./
COPY src ./src
COPY public ./public
```

<p>
<Step>9</Step> Install the right package manager and dependencies. 
</p>

- If you use NPM, put the following in your Dockerfile:

  ```docker
  RUN npm i
  ```

- If you use Yarn or PNPM, add the `packageManager` field to your `package.json` (example: `"packageManager": "pnpm@7.7.1"`) and remove the `npm` line from step 2. Then put following in your Dockerfile:

  ```docker title="If you use PNPM"
  RUN corepack enable
  RUN pnpm i
  ```

  ```docker title="If you use Yarn"
  RUN corepack enable
  RUN yarn
  ```
</p>

```docker
RUN npm i
```

<p>
<Step>10</Step> Run your code. It can be a CLI command or a Node.JS app.
</p>

```docker
COPY render.mjs render.mjs
CMD ["node", "render.mjs"]
```

Example script:

```js title="render.mjs"
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const bundled = await bundle({
  entryPoint: require.resolve("./src/index.ts"),
  // If you have a Webpack override, make sure to import it here
  webpackOverride: (config) => config,
});

const compositions = await getCompositions(bundled);
const composition = compositions[0];

console.log("Starting to render composition", composition.id);

await renderMedia({
  codec: "h264",
  composition,
  serveUrl: bundled,
  outputLocation: `out/${composition.id}.mp4`,
});
console.log(`Rendering composition ${composition.id}...`);
```

## Building a docker image

Run

```sh
docker build -t remotion-app .
```

to build a docker image called `remotion-app`. Use the following command to run the image:

```sh
docker run remotion-app
```
