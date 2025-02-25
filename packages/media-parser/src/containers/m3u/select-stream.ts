import type {M3uStream} from './get-streams';

export type SelectM3uStreamFnOptions = {
	streams: M3uStream[];
};

export type SelectM3uStreamFn = (
	options: SelectM3uStreamFnOptions,
) => number | Promise<number>;

export const selectStream = async ({
	streams,
	fn,
}: {
	streams: M3uStream[];
	fn: SelectM3uStreamFn;
}) => {
	if (streams.length < 1) {
		throw new Error('No streams found');
	}

	const selectedStreamId = await fn({streams});
	const selectedStream = streams.find(
		(stream) => stream.id === selectedStreamId,
	);

	if (!selectedStream) {
		throw new Error(`No stream with the id ${selectedStreamId} found`);
	}

	return Promise.resolve(selectedStream);
};

export const defaultSelectM3uStreamFn: SelectM3uStreamFn = ({streams}) => {
	return Promise.resolve(streams[0].id);
};
