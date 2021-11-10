cd ..
cd lambda
npm run buildlambda
cd ..
cd example
npx remotion lambda functions rm $(npx remotion lambda functions ls -q) -f
npx remotion lambda functions deploy 
npm run deploys3
npm run renderlambda
