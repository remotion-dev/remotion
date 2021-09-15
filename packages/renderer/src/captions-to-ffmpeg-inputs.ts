import {TCaption} from 'remotion';

export const captionsToFfmpegInputs = ({
	assetsCount,
	captions,
}: {
	assetsCount: number;
	captions: TCaption[][];
}): [string, string][] => {
	const allSrcs = Array.from(
		new Set(captions.flat().map((caption) => caption.src))
	);

	return allSrcs.map((src) => ['-i', src]);
	// TODO: Compute input position
	// if (isAudioOnly && assets.length === 0) {
	// 	return [
	// 		['-f', 'lavfi'],
	// 		['-i', 'anullsrc'],
	// 		['-t', (frameCount / fps).toFixed(4)],
	// 	];
	// }
	// return assets.map((path) => ['-i', path]);
};
