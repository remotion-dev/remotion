set -e
cd ..
cd renderer
bun build.ts --cloudrun
cd ..
cd cloudrun
bun run make
cd container
ARTIFACT_REGISTRY_ENV=development node submit.mjs
cd ..
cd ..
cd example
pnpm exec remotion cloudrun services rmall -f
pnpm exec remotion cloudrun sites create --site-name=testbed
ARTIFACT_REGISTRY_ENV=development pnpm exec remotion cloudrun services deploy --cpuLimit=4.0
pnpm exec remotion cloudrun render testbed OffthreadRemoteVideo --log=verbose
