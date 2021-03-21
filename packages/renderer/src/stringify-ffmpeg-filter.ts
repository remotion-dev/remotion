import {Internals} from 'remotion';
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
	return (
		`[${streamIndex}:a]` +
		[
			`atrim=${trimLeft}:${trimRight}`,
			`adelay=${new Array(channels).fill(startInVideo).join('|')}`,
			'volume=' + simulatenousAssets,
		]
			.filter(Internals.truthy)
			.join(',') +
		`[a${streamIndex}]`
	);
};
