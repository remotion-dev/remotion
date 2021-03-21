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
}: {
	streamIndex: number;
	trimLeft: string;
	trimRight: string;
	channels: number;
	startInVideo: string;
	simulatenousAssets: number;
	volume: AssetVolume;
}) => {
	const volumeFilter = ffmpegVolumeExpression(volume, simulatenousAssets);
	return (
		`[${streamIndex}:a]` +
		[
			`atrim=${trimLeft}:${trimRight}`,
			`adelay=${new Array(channels).fill(startInVideo).join('|')}`,
			`volume=${volumeFilter.value}:eval=${volumeFilter.eval}`,
		]
			.filter(Internals.truthy)
			.join(',') +
		`[a${streamIndex}]`
	);
};
