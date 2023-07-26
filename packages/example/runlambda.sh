set -e
cd ..
cd lambda
npm run buildlambda
cd ..
cd example
pnpm exec remotion lambda functions rmall -f
pnpm exec remotion lambda functions deploy --memory=3000
pnpm exec remotion lambda sites create --site-name=testbed-v6 --log=verbose
pnpm exec remotion lambda render testbed-v6 prores-test --out-name=ggg.mov ggg.mov --log=verbose --image-format=png --pixel-format=yuva444p10le --codec=prores --prores-profile=4444
