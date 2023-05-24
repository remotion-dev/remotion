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
pnpm exec remotion cloudrun sites create --site-name=testbed
pnpm exec remotion cloudrun services deploy --cpuLimit=4.0
pnpm exec remotion cloudrun render media testbed react-svg --log=verbose
