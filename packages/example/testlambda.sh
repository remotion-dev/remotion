cd ..
cd lambda
npm run buildlambda
cd ..
cd example
pnpm exec remotion lambda policies validate
pnpm exec remotion lambda functions rmall -f
pnpm exec remotion lambda functions deploy --memory=3000
pnpm exec remotion lambda sites create src/index.tsx --site-name=testbed
pnpm exec remotion lambda render testbed  react-svg --out-name=ggg.mp4 ggg.mp4 --log=verbose 
