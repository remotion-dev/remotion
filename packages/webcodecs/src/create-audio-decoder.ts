export const createAudioDecoder = ({
	onProgress,
	onFrame,
}: {
	onProgress: (decoded: number) => void;
	onFrame: (frame: AudioData) => void;
}) => {
	let decodedFrames = 0;

	const decoder = new AudioDecoder({
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
