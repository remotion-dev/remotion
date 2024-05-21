set -e
cd ..
cd renderer
node build.mjs --cloudrun
cd ..
cd cloudrun
pnpm run buildContainer
cd container
ARTIFACT_REGISTRY_ENV=development node submit.mjs
cd ..
cd ..
cd example
bunx remotion cloudrun services rmall -f
bunx remotion cloudrun sites create --site-name=testbed
ARTIFACT_REGISTRY_ENV=development bunx remotion cloudrun services deploy --cpuLimit=4.0
bunx remotion cloudrun render testbed OffthreadRemoteVideo --log=verbose
