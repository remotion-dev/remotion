---
image: /generated/articles-docs-docker.png
id: docker
title: Dockerizing a Remotion app
crumb: "Building video apps"
---

We recommend the following structure for your Dockerfile. Read below about the individual steps and whether you need to adjust them.

```docker title="Dockerfile"
FROM alpine:3.17

# Install necessary packages
RUN apk update
RUN apk add --no-cache chromium-swiftshader="109.0.5414.74-r0" ffmpeg="5.1.2-r1" nodejs-current="19.3.0-r0"

# Add a user so Chrome can use the sandbox.
RUN addgroup -S remotion && adduser -S -g remotion remotion
RUN mkdir -p /out /node_modules
RUN chown -R remotion:remotion /node_modules /out

# Copy everything from your project to the docker image. Adjust if needed.
COPY package.json package*.json yarn.lock* pnpm-lock.yaml* tsconfig.json* remotion.config.* ./
COPY src ./src
COPY public ./public

# Install the right package manager and dependencies - see below for Yarn/PNPM
RUN npm i

# Run everything after as non-privileged user.
USER remotion

# Run your application
COPY render.mjs render.mjs
CMD ["node", "render.mjs"]
```

## Line-by-line

<p>
<Step>1</Step> The Alpine image is used because it is very slim by default.
</p>

```docker
FROM alpine:3.17
RUN apk update
```

<p>
<Step>2</Step> The package index is updated to ensure all the libraries needed are available. Afterwards, the following packages are installed:
</p>

- `chromium-swiftshader`: The headless version of Chrome. `swiftshader` is required for WebGL, if you don't require it, you can replace `chromium-switftshader` with `chromium`.
- `ffmpeg`: Required for video encoding.
- `nodejs-current`: Node.js to run Remotion.
- `npm`: The package manager. If you intend to use `yarn` or `pnpm`, you can remove this line.

```docker
RUN apk update
RUN apk add --no-cache \
  chromium-swiftshader="109.0.5414.74-r0" \
  ffmpeg="5.1.2-r1" \
  nodejs-current="19.3.0-r0" \
  npm="9.1.2-r0"
```

<p>
<Step>3</Step> Chrome will not allow to run as root, so we create a user and group called <code>remotion</code>.
</p>

```docker
RUN addgroup -S remotion && adduser -S -g remotion remotion
RUN mkdir -p /out /node_modules
RUN chown -R remotion:remotion /node_modules /out
```

<p>
<Step>4</Step> Copy the files from your project. If you have additional source files, add them here. If some files do not exist, remove them.
</p>

The <code>COPY</code> syntax allows multiple files, but at least one file must exist. It is assumed <code>package.json</code>, <code>src</code> and <code>public</code> exist in your project, but you can adjust this to your needs.

```docker
COPY package.json package*.json yarn.lock* pnpm-lock.yaml* tsconfig.json* remotion.config.* ./
COPY src ./src
COPY public ./public
```

<p>
<Step>5</Step>
Install the right package manager and dependencies. 
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

<p>
<Step>6</Step>
Run all subsequent commands as the non-privileged <code>remotion</code> user.
</p>

```docker
USER remotion
```

<p>
<Step>7</Step>
Run your code. It can be a CLI command or a Node.JS app.
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
