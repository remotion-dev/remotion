import {Internals} from 'remotion';

export const stringifyFfmpegFilter = ({
	streamIndex,
	trimLeft,
	trimRight,
	channels,
	startInVideo,
	volume,
}: {
	streamIndex: number;
	trimLeft: string;
	trimRight: string;
	channels: number;
	startInVideo: string;
	volume: number;
}) => {
	return (
		`[${streamIndex}:a]` +
		[
			`atrim=${trimLeft}:${trimRight}`,
			`adelay=${new Array(channels).fill(startInVideo).join('|')}`,
			'volume=' + volume,
		]
			.filter(Internals.truthy)
			.join(',') +
		`[a${streamIndex}]`
	);
};
