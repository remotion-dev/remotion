set -e
cd ..
cd lambda
npm run buildlambda
cd ..
cd example
bunx remotion lambda functions rmall -f
bunx remotion lambda functions deploy --memory=3000 --disk=10000
bunx remotion lambda sites create --site-name=testbed-v6 --log=verbose --enable-folder-expiry
bunx remotion lambda render testbed-v6 OffthreadRemoteVideo --log=verbose --delete-after="1-day" --enable-streaming
