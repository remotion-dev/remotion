import type {M3uStream} from './get-streams';

export const selectStream = (streams: M3uStream[]) => {
	if (!streams.length) {
		throw new Error('No streams found');
	}

	// TODO: Select the first stream for now
	const selectedStream = streams[0];
	return Promise.resolve(selectedStream);
};
