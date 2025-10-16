import type {CanvasSink, WrappedCanvas} from 'mediabunny';

export const createVideoIterator = (
	timeToSeek: number,
	videoSink: CanvasSink,
) => {
	let destroyed = false;
	const iterator = videoSink.canvases(timeToSeek);
	let nextFrame: WrappedCanvas | null = null;

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
		getNextFrame: () => {
			return nextFrame;
		},
		setNextFrame: (frame: WrappedCanvas) => {
			nextFrame = frame;
		},
		clearNextFrame: () => {
			nextFrame = null;
		},
	};
};

export type VideoIterator = ReturnType<typeof createVideoIterator>;
