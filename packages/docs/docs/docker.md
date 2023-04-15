---
image: /generated/articles-docs-docker.png
id: docker
title: Dockerizing a Remotion app
crumb: "Building video apps"
---

We recommend the following structure for your Dockerfile. Read below about the individual steps and whether you need to adjust them.

```docker title="Dockerfile"
FROM debian:bookworm-20230411

RUN apt-get update
RUN apt show chromium
RUN apt-get install -y nodejs npm ffmpeg chromium

# Copy everything from your project to the Docker image. Adjust if needed.
COPY package.json package*.json yarn.lock* pnpm-lock.yaml* tsconfig.json* remotion.config.* ./
COPY src ./src
# If you have a public folder:
COPY public ./public

# Specify the location of the Chromium browser
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install the right package manager and dependencies - see below for Yarn/PNPM
RUN npm i

# Run your application
COPY render.mjs render.mjs
CMD ["node", "render.mjs"]
```

:::note
[Click here](#example-render-script) to see an example for a `render.mjs` script you can use.
:::

:::note
This Dockerfile is unable to render WebGL content. Suggestions on how to improve the Dockerfile to support it are welcomed.
:::

## Line-by-line

<p>
<Step>1</Step> Specify the base image for the Dockerfile. In this case, we use Debian.
</p>

```docker
FROM debian:bookworm-20230411
```

<p>
<Step>2</Step> Update the package lists on the Debian system.
</p>

```docker
RUN apt-get update
```

<p>
<Step>3</Step> Download Remotion's dependencies: Node.JS (with NPM), FFmpeg and Chromium. 
</p>

```docker
RUN apt-get install -y nodejs npm ffmpeg chromium
```

<p>
<Step>4</Step> Copy the files from your project. If you have additional source files, add them here. If some files do not exist, remove them.
The <code>COPY</code> syntax allows multiple files, but at least one file must exist. It is assumed <code>package.json</code>, <code>src</code> and <code>public</code> exist in your project, but you can adjust this to your needs.
</p>

```docker
COPY package.json package*.json yarn.lock* pnpm-lock.yaml* tsconfig.json* remotion.config.* ./
COPY src ./src
COPY public ./public
```

<p>
<Step>5</Step> Tell Remotion where the Chromium executable is located.
</p>

```docker
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

:::note
If you are on Remotion `v3.3.81` or higher, you don't need this line.
:::

<p>
<Step>6</Step> Install the right package manager and dependencies. 
</p>

- If you use NPM, put the following in your Dockerfile:

  ```docker
  RUN npm i
  ```

- If you use Yarn or PNPM, add the `packageManager` field to your `package.json` (example: `"packageManager": "pnpm@7.7.1"`) and remove the `npm` line from step 3. Then put following in your Dockerfile:

  ```docker title="If you use PNPM"
  RUN corepack enable
  RUN pnpm i
  ```

  ```docker title="If you use Yarn"
  RUN corepack enable
  RUN yarn
  ```

<p>
<Step>7</Step> Run your code. It can be a CLI command or a Node.JS app.
</p>

```docker
COPY render.mjs render.mjs
CMD ["node", "render.mjs"]
```

## Example render script

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
console.log(`Rendered composition ${composition.id}.`);
```

## Building the Docker image

Run

```sh
docker build -t remotion-app .
```

to build a Docker image called `remotion-app`.  
Use the following command to run the image:

```sh
docker run remotion-app
```

## Why are the packages not pinned?

In Debian (and also Alpine), old packages are removed from the repositories once new versions are released. This means that pinning the versions will actually cause the Dockerfiles to break in the future. We choose Debian as the distribution because the packages get well tested before they get released into the repository.

## Changelog

**April 15th, 2023**: Unpinning the versions in Debian since it would cause breakage.

**April 3rd, 2023**: Changed the Alpine Docker image to a Debian one, since the versions of Alpine packages cannot be pinned. This makes the Debian one less likely to break.
