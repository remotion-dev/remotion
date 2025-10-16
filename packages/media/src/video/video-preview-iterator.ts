import type {CanvasSink} from 'mediabunny';

export const createVideoIterator = (
	timeToSeek: number,
	videoSink: CanvasSink,
) => {
	let destroyed = false;
	const iterator = videoSink.canvases(timeToSeek);

	return {
		destroy: () => {
			destroyed = true;
			iterator.return().catch(() => undefined);
		},
		getNext: () => {
			return iterator.next();
		},
		isDestroyed: () => {
			return destroyed;
		},
	};
};

export type VideoIterator = ReturnType<typeof createVideoIterator>;
