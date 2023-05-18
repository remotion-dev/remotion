# TODO: Needs to deploy site and unhardcode service name
set -e
cd ..
cd cloudrun
pnpm run buildContainer
cd container
node submit.mjs
cd ..
cd ..
cd example
pnpm exec remotion cloudrun services rmall -f
sleep 3
pnpm exec remotion cloudrun sites create --site-name=testbed
pnpm exec remotion cloudrun services deploy
pnpm exec remotion cloudrun render still testbed react-svg
