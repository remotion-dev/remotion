export const createVideoDecoder = ({
	onProgress,
	onFrame,
}: {
	onProgress: (decoded: number) => void;
	onFrame: (frame: VideoFrame) => void;
}) => {
	let decodedFrames = 0;

	const decoder = new VideoDecoder({
		output(inputFrame) {
			onFrame(inputFrame);
			inputFrame.close();

			onProgress(++decodedFrames);
		},
		error(error) {
			console.error(error);
		},
	});

	return {decoder};
};
