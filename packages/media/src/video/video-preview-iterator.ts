import type {CanvasSink} from 'mediabunny';

export const createVideoIterator = (
	timeToSeek: number,
	videoSink: CanvasSink,
) => {
	let destroyed = false;
	const iterator = videoSink.canvases(timeToSeek);

	const getNextOrNullIfNotAvailable = async () => {
		const next = iterator.next();
		const result = await Promise.race([
			next,
			new Promise<void>((resolve) => {
				Promise.resolve().then(() => resolve());
			}),
		]);
		if (!result) {
			return {
				type: 'need-to-wait-for-it' as const,
				waitPromise: async () => {
					const res = await next;
					return res.value;
				},
			};
		}

		return {
			type: 'got-frame-or-end' as const,
			frame: result.value,
		};
	};

	return {
		getNextOrNullIfNotAvailable,
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
