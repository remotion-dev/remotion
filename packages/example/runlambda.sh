set -e
cd ..
cd lambda
bun run make
bun run makeruntime
cd ..
cd example
bunx remotion lambda functions rmall -f
bunx remotion lambda functions deploy --memory=3000 --disk=10000
bunx remotion lambda sites create --site-name=testbed-v6 --log=verbose --enable-folder-expiry
bunx remotion lambda render testbed-v6 OffthreadRemoteVideo --log=verbose --delete-after="1-day" --api-key=rm_pub_9a996d341238eaa34e696b099968d8510420b9f6ba4aa0ee
