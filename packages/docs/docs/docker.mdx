---
image: /generated/articles-docs-docker.png
id: docker
sidebar_label: Docker
title: Dockerizing a Remotion app
crumb: 'Building video apps'
---

We recommend the following structure for your Dockerfile. Read below about the individual steps and whether you need to adjust them.

```docker title="Dockerfile"
FROM node:22-bookworm-slim

# Install Chrome dependencies
RUN apt-get update
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
  libpango-1.0-0 \
  libcairo2 \
  libcups2

# Copy everything from your project to the Docker image. Adjust if needed.
COPY package.json package*.json yarn.lock* pnpm-lock.yaml* bun.lockb* bun.lock* tsconfig.json* remotion.config.* ./
COPY src ./src

# If you have a public folder:
COPY public ./public

# Install the right package manager and dependencies - see below for Yarn/PNPM
RUN npm i

# Install Chrome
RUN npx remotion browser ensure

# Run your application
COPY render.mjs render.mjs
CMD ["node", "render.mjs"]
```

:::note
[Click here](#example-render-script) to see an example for a `render.mjs` script you can use.
:::

## Line-by-line

<p>
  <Step>1</Step> Specify the base image for the Dockerfile. In this case, we use Debian.
</p>

```docker
FROM node:22-bookworm-slim
```

<p>
  <Step>2</Step> Update the package lists on the Debian system and install the needed [shared libraries](/docs/miscellaneous/linux-dependencies) for Chrome Headless Shell.
</p>

```docker
RUN apt-get update
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
```

<p>
  <Step>3</Step> Copy the files from your project. If you have additional source files, add them here. If some files do not exist, remove them. The <code>COPY</code> syntax allows multiple files, but at least one file must exist. It is assumed <code>package.json</code>, <code>src</code> and{' '}
  <code>public</code> exist in your project, but you can adjust this to your needs.
</p>

```docker
COPY package.json package*.json yarn.lock* pnpm-lock.yaml* bun.lockb* bun.lock* tsconfig.json* remotion.config.* ./
COPY src ./src
COPY public ./public
```

<p>
  <Step>4</Step> Install the right package manager and dependencies.
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
  <Step>5</Step> Install [Chrome Headless Shell](/docs/miscellaneous/chrome-headless-shell).
</p>

```docker
RUN npx remotion browser ensure
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
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

const bundled = await bundle({
  entryPoint: require.resolve('./src/index.ts'),
  // If you have a webpack override in remotion.config.ts, pass it here as well.
  webpackOverride: (config) => config,
});

const inputProps = {};

const composition = await selectComposition({
  serveUrl: bundled,
  id: 'MyComp',
  inputProps,
});

console.log('Starting to render composition');

await renderMedia({
  codec: 'h264',
  composition,
  serveUrl: bundled,
  outputLocation: `out/${composition.id}.mp4`,
  chromiumOptions: {
    enableMultiProcessOnLinux: true,
  },
  inputProps,
});

console.log(`Rendered composition ${composition.id}.`);
```

:::note
We recommend setting the `enableMultiProcessOnLinux` option for this Docker image, available from v4.0.42. [Read more](/docs/miscellaneous/linux-single-process)
:::

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

## Giving access to the CPUs

By default, Docker containers are not allowed to use all memory CPUs . Consider:

- Changing the resource settings in Docker Desktop settings
- Using the `--cpus` and `--cpuset-cpus` flags with the `docker run` command. Example: `--cpus=16 --cpuset-cpus=0-15`

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

**November 6th, 2024**: Use node:22-bookworm-slim over node:20-bookworm to update to LTS and get a much smaller image.
**October 11th, 2023**: Used the node:20-bookworm, which is faster to deploy and also Debian.

**September 25th, 2023**: Recommend setting `enableMultiProcessOnLinux`.

**May 30th, 2023**: Update document for Remotion 4.0.

**April 15th, 2023**: Unpinning the versions in Debian since it would cause breakage.

**April 3rd, 2023**: Changed the Alpine Docker image to a Debian one, since the versions of Alpine packages cannot be pinned. This makes the Debian one less likely to break.

## See also

- [Deploying the Remotion Studio](/docs/studio/deploy-server)
