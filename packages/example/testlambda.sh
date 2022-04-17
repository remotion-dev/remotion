cd ..
cd lambda
npm run buildlambda
cd ..
cd example
pnpx remotion lambda policies validate
pnpx remotion lambda functions rmall -f
pnpx remotion lambda functions deploy --memory=3000
pnpx remotion lambda sites create src/index.tsx --site-name=testbed
pnpx remotion lambda render testbed  react-svg --out-name=ggg.mp4 ggg.mp4 --log=verbose 
