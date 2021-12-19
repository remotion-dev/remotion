cd ..
cd lambda
npm run buildlambda
cd ..
cd example
npx remotion lambda policies validate
npx remotion lambda functions rmall -f
npx remotion lambda functions deploy --memory=3000
npx remotion lambda sites create src/index.tsx --site-name=testbed
npx remotion lambda render https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/testbed/index.html --frames=10-20 react-svg --log=verbose
