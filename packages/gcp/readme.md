`pnpm run start` will trigger a build command, which will compile the typescript into dist folder as javascript. It will then start the server.

In the Dockerfile, adding Chromium via `ADD ./chromium-x64 /opt/bin/chromium`
in index.ts, `readdirSync('/opt/bin/chromium/bin').forEach(` lists all the files as expected, so we know the binary is being copied in there.