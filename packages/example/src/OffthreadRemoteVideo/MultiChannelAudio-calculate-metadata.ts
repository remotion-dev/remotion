import {parseMedia} from '@remotion/media-parser';
import {CalculateMetadataFunction} from 'remotion';

const fps = 30;
const src = 'https://remotion.media/multiple-audio-streams.mov';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {slowDurationInSeconds} = await parseMedia({
		src,
		acknowledgeRemotionLicense: true,
		fields: {
			slowDurationInSeconds: true,
		},
	});

	return {
		durationInFrames: Math.round(slowDurationInSeconds * fps),
		fps,
	};
};
