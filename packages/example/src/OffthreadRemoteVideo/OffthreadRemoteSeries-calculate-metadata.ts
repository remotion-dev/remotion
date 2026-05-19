import {parseMedia} from '@remotion/media-parser';
import {CalculateMetadataFunction, staticFile} from 'remotion';

const fps = 30;
const sources = [
	staticFile('bigbuckbunny.mp4'),
	'https://remotion.media/video.mp4',
];

type Props = {
	durations: number[] | null;
};

export const calculateMetadataFn: CalculateMetadataFunction<
	Props
> = async () => {
	const all = await Promise.all(
		sources.map(async (src) => {
			const {slowDurationInSeconds, dimensions} = await parseMedia({
				src,
				acknowledgeRemotionLicense: true,
				fields: {
					slowDurationInSeconds: true,
					dimensions: true,
				},
			});
			return {
				src,
				slowDurationInSeconds,
				dimensions,
			};
		}),
	);

	const allDurations = all
		.map((a) => a.slowDurationInSeconds)
		.reduce((a, b) => a + b, 0);
	const biggestDimension = all.reduce((a, b) => {
		if (a.dimensions === null) {
			return b;
		}
		if (b.dimensions === null) {
			return a;
		}

		return a.dimensions.width * a.dimensions.height >
			b.dimensions.width * b.dimensions.height
			? a
			: b;
	}, all[0]);

	return {
		durationInFrames: Math.round(allDurations * fps),
		fps,
		width: Math.floor(biggestDimension.dimensions!.width / 2) * 2,
		height: Math.floor(biggestDimension.dimensions!.height / 2) * 2,
		props: {
			durations: all.map((a) => a.slowDurationInSeconds),
		},
	};
};

export {sources, fps};
export type {Props};
