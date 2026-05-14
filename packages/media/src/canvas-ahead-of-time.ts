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
	let inFlight: Promise<void> | null = null;

	const closeFrame = (frame: WrappedCanvas) => {
		(frame as unknown as {close?: () => void}).close?.();
	};

	const fillNext = () => {
		if (chaining || reachedEnd || closed) return;
		if (buffer.length >= BUFFER_SIZE) return;

		chaining = true;
		const slot: Slot = {promise: iterator.next(), resolved: null};
		buffer.push(slot);
		inFlight = slot.promise.then(
			(result) => {
				slot.resolved = result;
				chaining = false;
				inFlight = null;
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
				inFlight = null;
			},
		);
	};

	fillNext();

	const next = (): CanvasAheadOfTimeNext => {
		const slot = buffer.shift();
		fillNext();

		if (!slot) {
			if (reachedEnd || closed) {
				return {type: 'ready', frame: null};
			}

			const chain = inFlight;
			return {
				type: 'pending',
				wait: async () => {
					await chain;
					const next2 = buffer.shift();
					fillNext();
					if (!next2) return null;
					if (next2.resolved) {
						return next2.resolved.done ? null : next2.resolved.value;
					}

					const result = await next2.promise;
					return result.done ? null : result.value;
				},
			};
		}

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
			if (slot.resolved && !slot.resolved.done) {
				closeFrame(slot.resolved.value);
			}
			// Unresolved slots: the chain handler in fillNext will close
			// the frame when it resolves (it observes `closed === true`).
		}

		buffer.length = 0;
		await iterator.return();
	};

	return {next, closeIterator};
};

export type CanvasAheadOfTimeIterator = ReturnType<typeof canvasesAheadOfTime>;
