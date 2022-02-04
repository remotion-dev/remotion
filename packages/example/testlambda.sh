cd ..
cd lambda
npm run buildlambda
cd ..
cd example
npx remotion lambda policies validate
npx remotion lambda functions rmall -f
npx remotion lambda functions deploy --memory=3000 --architecture=x86_64
npx remotion lambda sites create src/index.tsx --site-name=testbed
npx remotion lambda render testbed --frames=10-20 react-svg --out-name=ggg.mp4 ggg.mp4 --log=verbose 
