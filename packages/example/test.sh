bunx remotion render new-video --log=verbose --frames=0-20 --concurrency=1 --codec=aac --for-seamless-aac-concatenation newvideo1.aac
ffmpeg -i newvideo1.aac newvideo1.wav
bunx remotion render new-video --log=verbose --frames=21-39 --concurrency=1 --codec=aac --for-seamless-aac-concatenation newvideo2.aac
ffmpeg -i newvideo2.aac newvideo2.wav

bunx remotion render OffthreadRemoteVideo --log=verbose --frames=0-20 --concurrency=1 --codec=aac --for-seamless-aac-concatenation offthread1.aac
ffmpeg -i offthread1.aac offthread1.wav
bunx remotion render OffthreadRemoteVideo --log=verbose --frames=21-39 --concurrency=1 --codec=aac --for-seamless-aac-concatenation offthread2.aac
ffmpeg -i offthread2.aac offthread2.wav
