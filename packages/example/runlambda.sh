set -e
cd ..
cd lambda
bun run build
cd ..
cd example
bunx remotion lambda functions rmall -f
bunx remotion lambda functions deploy --memory=4096 --disk=10000
bunx remotion lambda sites create --site-name=testbed-v6 --log=verbose --enable-folder-expiry
bunx remotion lambda render https://remotionlambda-7ar4bvmj7p.s3.us-east-1.amazonaws.com/sites/test-render-90/index.html RenderTest --log=verbose --delete-after="1-day" --props=props.json
