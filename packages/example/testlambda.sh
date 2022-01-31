cd ..
cd lambda
npm run buildlambda
cd ..
cd example
npx remotion lambda policies validate
npx remotion lambda functions rmall -f
npx remotion lambda functions deploy --memory=3000
npx remotion lambda sites create src/index.tsx --site-name=testbed
npx remotion lambda render testbed  --image-format=png --pixel-format=yuva420p --codec=vp8 react-svg --out-name=ggg.mp4 ggg.mp4 --log=verbose
