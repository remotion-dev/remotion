import {Internals} from 'remotion';
import {ffmpegVolumeExpression} from './assets/ffmpeg-volume-expression';
import {AssetVolume} from './assets/types';

export const stringifyFfmpegFilter = ({
	streamIndex,
	trimLeft,
	trimRight,
	channels,
	startInVideo,
	simulatenousAssets,
	volume,
	fps,
}: {
	streamIndex: number;
	trimLeft: string;
	trimRight: string;
	channels: number;
	startInVideo: number;
	simulatenousAssets: number;
	volume: AssetVolume;
	fps: number;
}) => {
	const startInVideoSeconds = ((startInVideo / fps) * 1000).toFixed(); // in milliseconds

	const volumeFilter = ffmpegVolumeExpression({
		volume,
		multiplier: simulatenousAssets,
		startInVideo,
	});
	return (
		`[${streamIndex}:a]` +
		[
			`atrim=${trimLeft}:${trimRight}`,
			`adelay=${new Array(channels).fill(startInVideoSeconds).join('|')}`,
			`volume=${volumeFilter.value}:eval=${volumeFilter.eval}`,
		]
			.filter(Internals.truthy)
			.join(',') +
		`[a${streamIndex}]`
	);
};
