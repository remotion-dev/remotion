cd ..
cd lambda
npm run buildlambda
cd ..
cd example
bunx remotion lambda functions rmall -f
bunx remotion lambda functions deploy --memory=1200
bunx remotion lambda sites create --site-name=testbed-v6 --log=verbose --enable-folder-expiry
bunx remotion lambda render https://d1g5u9jwlazupk.cloudfront.net/sites/meliplay-clips/index.html SingleOffthreadVideoWithTimecode --props='{"videoUrl": "https://d1g5u9jwlazupk.cloudfront.net/sample_clip.mp4"}' --log=verbose
bunx remotion lambda render https://d1g5u9jwlazupk.cloudfront.net/sites/meliplay-clips/index.html SingleOffthreadVideoWithTimecode --props='{"videoUrl": "https://d1g5u9jwlazupk.cloudfront.net/sample_clip.mp4"}' --log=verbose
bunx remotion lambda render https://d1g5u9jwlazupk.cloudfront.net/sites/meliplay-clips/index.html SingleOffthreadVideoWithTimecode --props='{"videoUrl": "https://d1g5u9jwlazupk.cloudfront.net/sample_clip.mp4"}' --log=verbose
bunx remotion lambda render https://d1g5u9jwlazupk.cloudfront.net/sites/meliplay-clips/index.html SingleOffthreadVideoWithTimecode --props='{"videoUrl": "https://d1g5u9jwlazupk.cloudfront.net/sample_clip.mp4"}' --log=verbose
bunx remotion lambda render https://d1g5u9jwlazupk.cloudfront.net/sites/meliplay-clips/index.html SingleOffthreadVideoWithTimecode --props='{"videoUrl": "https://d1g5u9jwlazupk.cloudfront.net/sample_clip.mp4"}' --log=verbose
bunx remotion lambda render https://d1g5u9jwlazupk.cloudfront.net/sites/meliplay-clips/index.html SingleOffthreadVideoWithTimecode --props='{"videoUrl": "https://d1g5u9jwlazupk.cloudfront.net/sample_clip.mp4"}' --log=verbose
bunx remotion lambda render https://d1g5u9jwlazupk.cloudfront.net/sites/meliplay-clips/index.html SingleOffthreadVideoWithTimecode --props='{"videoUrl": "https://d1g5u9jwlazupk.cloudfront.net/sample_clip.mp4"}' --log=verbose
