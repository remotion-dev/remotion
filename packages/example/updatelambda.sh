cd ..
cd lambda
npm run buildlambda
cd ..
cd example
npx remotion lambda functions rmall -f
npx remotion lambda functions deploy --memory=2500
