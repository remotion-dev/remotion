import type {CanvasSink, WrappedCanvas} from 'mediabunny';

export type CanvasAheadOfTimeNext =
	| {type: 'ready'; frame: WrappedCanvas | null}
	| {type: 'pending'; wait: () => Promise<WrappedCanvas | null>};

const BUFFER_SIZE = 3;

type Slot = {
	promise: Promise<IteratorResult<WrappedCanvas, void>>;
	resolved: IteratorResult<WrappedCanvas, void> | null;
};

export const canvasesAheadOfTime = (
	videoSink: CanvasSink,
	startTimestamp?: number,
) => {
	const iterator = videoSink.canvases(startTimestamp);

	const buffer: Slot[] = [];
	let chaining = false;
	let reachedEnd = false;
	let closed = false;

	const closeFrame = (frame: WrappedCanvas) => {
		(frame as unknown as {close?: () => void}).close?.();
	};

	const fillNext = () => {
		if (chaining || reachedEnd || closed) return;
		if (buffer.length >= BUFFER_SIZE) return;

		chaining = true;
		const slot: Slot = {promise: iterator.next(), resolved: null};
		buffer.push(slot);
		slot.promise.then(
			(result) => {
				slot.resolved = result;
				chaining = false;
				if (result.done) {
					reachedEnd = true;
					return;
				}

				if (closed) {
					closeFrame(result.value);
					return;
				}

				fillNext();
			},
			() => {
				chaining = false;
			},
		);
	};

	fillNext();

	const next = (): CanvasAheadOfTimeNext => {
		const slot = buffer.shift();
		if (!slot) {
			return {type: 'ready', frame: null};
		}

		fillNext();

		if (slot.resolved) {
			if (slot.resolved.done) {
				return {type: 'ready', frame: null};
			}

			return {type: 'ready', frame: slot.resolved.value};
		}

		return {
			type: 'pending',
			wait: async () => {
				const result = await slot.promise;
				return result.done ? null : result.value;
			},
		};
	};

	const closeIterator = async () => {
		closed = true;
		for (const slot of buffer) {
			if (slot.resolved) {
				if (!slot.resolved.done) {
					closeFrame(slot.resolved.value);
				}
			} else {
				slot.promise.then(
					(result) => {
						if (!result.done) {
							closeFrame(result.value);
						}
					},
					() => undefined,
				);
			}
		}

		buffer.length = 0;
		await iterator.return();
	};

	return {next, closeIterator};
};

export type CanvasAheadOfTimeIterator = ReturnType<typeof canvasesAheadOfTime>;
