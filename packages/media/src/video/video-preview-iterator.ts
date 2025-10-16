import type {CanvasSink} from 'mediabunny';

export const createVideoIterator = (
	timeToSeek: number,
	videoSink: CanvasSink,
) => {
	const iterator = videoSink.canvases(timeToSeek);

	return {
		destroy: () => {
			iterator.return().catch(() => undefined);
		},
		getNext: () => {
			return iterator.next();
		},
	};
};

export type VideoIterator = ReturnType<typeof createVideoIterator>;
