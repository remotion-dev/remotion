set -e
cd ..
cd lambda
npm run buildlambda
cd ..
cd example
pnpm exec remotion lambda functions rmall -f
pnpm exec remotion lambda functions deploy --memory=4000 --timeout=900 --disk=10000
pnpm exec remotion lambda sites create --site-name=testbed-v6 --log=verbose --enable-folder-expiry
# pnpm exec remotion lambda render testbed-v6 OffthreadRemoteVideo --log=verbose --delete-after="1-day"
