import type {M3uStream} from './get-streams';

export type StreamSelectionFnOptions = {
	streams: M3uStream[];
};

export type StreamSelectionFn = (
	options: StreamSelectionFnOptions,
) => number | Promise<number>;

export const selectStream = async ({
	streams,
	fn,
}: {
	streams: M3uStream[];
	fn: StreamSelectionFn;
}) => {
	if (streams.length < 1) {
		throw new Error('No streams found');
	}

	const selectedStream = await fn({streams});
	return Promise.resolve(streams[selectedStream]);
};

export const defaultStreamSelectionFn: StreamSelectionFn = ({streams}) => {
	return Promise.resolve(streams[0].id);
};
