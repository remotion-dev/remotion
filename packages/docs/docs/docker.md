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
RUN apt-get install -y nodejs npm chromium

# Copy everything from your project to the Docker image. Adjust if needed.
COPY package.json package*.json yarn.lock* pnpm-lock.yaml* tsconfig.json* remotion.config.* ./
COPY src ./src

# If you have a public folder:
COPY public ./public

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
<Step>3</Step> Download Remotion's dependencies: Node.JS (with NPM) and Chromium. 
</p>

```docker
RUN apt-get install -y nodejs npm chromium
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
<Step>5</Step> Install the right package manager and dependencies. 
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
<Step>6</Step> Run your code. It can be a CLI command or a Node.JS app.
</p>

```docker
COPY render.mjs render.mjs
CMD ["node", "render.mjs"]
```

## Example render script

Assuming you want to render the composition `MyComp`:

```tsx twoslash title="render.mjs"
// @module: ESNext
// @target: ESNext
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const bundled = await bundle({
  entryPoint: require.resolve("./src/index.ts"),
  // If you have a Webpack override, make sure to import it here
  webpackOverride: (config) => config,
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: "MyComp",
});

console.log("Starting to render composition");

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

## Emojis

No emojis are installed by default. If you want to use emojis, install an emoji font:

```docker
RUN apt-get install fonts-noto-color-emoji
```

## Japanese, Chinese, Korean, etc.

Those fonts may have limited Character support enabled by default. If you need full support, install the following fonts:

```docker
RUN apt-get install fonts-noto-cjk
```

## Why are the packages not pinned?

In Debian (and also Alpine), old packages are removed from the repositories once new versions are released. This means that pinning the versions will actually cause the Dockerfiles to break in the future. We choose Debian as the distribution because the packages get well tested before they get released into the repository.

## Notes for older versions

- If you are on a lower version than `v4.0.0`, add `ffmpeg` to the list of packages to install:

  ```docker
  RUN apt-get install -y nodejs ffmpeg npm chromium
  ```

- If you are on Remotion `v3.3.80` or lower, tell Remotion where Chrome is installed:

  ```docker
  ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
  ```

## Recommendation: Don't use Alpine Linux

Alpine Linux is a lightweight distribution often used in Docker. There are two known issues with it when used in conjunction with Remotion:

- The launch of the Rust parts of Remotion may be very slow (>10sec slowdown per render)
- If a new version of Chrome gets released in the registry, you might be unable to downgrade because old versions are not kept and breaking changes can not be ruled out.

## Changelog

**May 30th, 2023**: Update document for Remotion 4.0.

**April 15th, 2023**: Unpinning the versions in Debian since it would cause breakage.

**April 3rd, 2023**: Changed the Alpine Docker image to a Debian one, since the versions of Alpine packages cannot be pinned. This makes the Debian one less likely to break.
