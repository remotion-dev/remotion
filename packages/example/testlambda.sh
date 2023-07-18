set -e
cd ..
cd lambda
npm run buildlambda
cd ..
cd example
pnpm exec remotion lambda functions rmall -f
pnpm exec remotion lambda functions deploy --memory=3000 --timeout=30
pnpm exec remotion lambda sites create --site-name=testbed-v6 --log=verbose
pnpm exec remotion lambda render testbed-v6 react-svg --out-name=ggg.mp4 ggg.mp4 --log=verbose 
