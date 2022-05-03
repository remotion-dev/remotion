export const assetsToFfmpegInputs = ({
	asset: audioMixFile,
	isAudioOnly,
	frameCount,
	fps,
}: {
	asset: string | null;
	isAudioOnly: boolean;
	frameCount: number;
	fps: number;
}): [string, string][] => {
	if (isAudioOnly && audioMixFile === null) {
		return [
			['-f', 'lavfi'],
			['-i', 'anullsrc'],
			['-t', (frameCount / fps).toFixed(4)],
		];
	}

	return [['-i', audioMixFile as string]];
};
