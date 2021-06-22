export const assetsToFfmpegInputs = ({
	assets,
	isAudioOnly,
	frameCount,
	fps,
}: {
	assets: string[];
	isAudioOnly: boolean;
	frameCount: number;
	fps: number;
}): [string, string][] => {
	if (isAudioOnly && assets.length === 0) {
		return [
			['-f', 'lavfi'],
			['-i', 'anullsrc'],
			['-t', (frameCount / fps).toFixed(4)],
		];
	}

	return assets.map((path) => ['-i', path]);
};
