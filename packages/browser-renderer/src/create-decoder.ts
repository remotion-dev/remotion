export const createDecoder = ({
	onProgress,
	onFrame,
}: {
	onProgress: (decoded: number) => void;
	onFrame: (frame: VideoFrame, keyframe: boolean) => void;
}) => {
	let decodedFrames = 0;
	let nextKeyFrameTimestamp = 0;

	const decoder = new VideoDecoder({
		async output(inputFrame) {
			const bitmap = await createImageBitmap(inputFrame);

			const keyFrameEveryHowManySeconds = 2;
			let keyFrame = false;
			if (inputFrame.timestamp >= nextKeyFrameTimestamp) {
				keyFrame = true;
				nextKeyFrameTimestamp =
					inputFrame.timestamp + keyFrameEveryHowManySeconds * 1e6;
			}

			const outputFrame = new VideoFrame(bitmap, {
				timestamp: inputFrame.timestamp,
				duration: inputFrame.duration as number,
			});

			onFrame(outputFrame, keyFrame);

			inputFrame.close();

			decodedFrames++;
			onProgress(decodedFrames);
		},
		error(error) {
			console.error(error);
		},
	});

	return {decoder};
};
