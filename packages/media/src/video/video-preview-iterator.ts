import type {WrappedCanvas} from 'mediabunny';
import {releaseStableFrame} from '../canvas-ahead-of-time';
import {roundTo4Digits} from '../helpers/round-to-4-digits';
import type {PrewarmedVideoIteratorCache} from '../prewarm-iterator-for-looping';

const MAXIMUM_AWAITED_PEEK_DISTANCE_SECONDS = 0.05;

export const createVideoIterator = async (
	timeToSeek: number,
	cache: PrewarmedVideoIteratorCache,
) => {
	let destroyed = false;
	const iterator = cache.makeIteratorOrUsePrewarmed(timeToSeek);
	let iteratorEnded = false;

	const firstAwait = iterator.next();
	const initialFrame =
		firstAwait && firstAwait.type === 'ready'
			? firstAwait.frame
			: await firstAwait.wait();
	let lastReturnedFrame = initialFrame;

	let peekedFrame: WrappedCanvas | null = null;

	const setLastReturnedFrame = (frame: WrappedCanvas) => {
		if (lastReturnedFrame !== frame) {
			releaseStableFrame(lastReturnedFrame);
		}

		lastReturnedFrame = frame;
	};

	const setPeekedFrame = (frame: WrappedCanvas | null) => {
		peekedFrame = frame;
		if (peekedFrame === null) {
			iteratorEnded = true;
		}

		return peekedFrame;
	};

	const peekIfReady = () => {
		if (peekedFrame) {
			return {type: 'ready' as const, frame: peekedFrame};
		}

		if (iteratorEnded) {
			return {type: 'ready' as const, frame: null};
		}

		const next = iterator.next();
		if (next.type === 'ready') {
			return {type: 'ready' as const, frame: setPeekedFrame(next.frame)};
		}

		return {
			type: 'pending' as const,
			wait: next.wait,
		};
	};

	const peek = async () => {
		const peeked = peekIfReady();
		if (peeked.type === 'ready') {
			return peeked.frame;
		}

		return setPeekedFrame(await peeked.wait());
	};

	const getFrameEndTimestampFromPeek = (frame: WrappedCanvas | null) => {
		return frame ? roundTo4Digits(frame.timestamp) : Infinity;
	};

	const getFrameEndTimestamp = async () => {
		return getFrameEndTimestampFromPeek(await peek());
	};

	const getFrameEndTimestampIfCloseEnough = async ({
		timestamp,
		frameTimestamp,
	}: {
		timestamp: number;
		frameTimestamp: number;
	}) => {
		const peeked = peekIfReady();
		if (peeked.type === 'ready') {
			return {
				type: 'ready' as const,
				timestamp: getFrameEndTimestampFromPeek(peeked.frame),
			};
		}

		if (timestamp - frameTimestamp > MAXIMUM_AWAITED_PEEK_DISTANCE_SECONDS) {
			return {type: 'pending' as const};
		}

		const awaitedPeeked = setPeekedFrame(await peeked.wait());
		return {
			type: 'ready' as const,
			timestamp: getFrameEndTimestampFromPeek(awaitedPeeked),
		};
	};

	const getNextOrNullIfNotAvailable = () => {
		if (peekedFrame) {
			const frame = peekedFrame;
			setLastReturnedFrame(frame);
			const retValue = {
				type: 'got-frame-or-end' as const,
				frame,
			};
			peekedFrame = null;
			return retValue;
		}

		const next = iterator.next();

		if (next.type === 'pending') {
			return {
				type: 'need-to-wait-for-it' as const,
				waitPromise: async () => {
					const res = await next.wait();
					if (res) {
						setLastReturnedFrame(res);
					} else {
						iteratorEnded = true;
					}

					return res;
				},
			};
		}

		if (next.frame) {
			setLastReturnedFrame(next.frame);
		} else {
			iteratorEnded = true;
		}

		return {
			type: 'got-frame-or-end' as const,
			frame: next.frame ?? null,
		};
	};

	const destroy = () => {
		destroyed = true;
		releaseStableFrame(lastReturnedFrame);
		if (peekedFrame !== lastReturnedFrame) {
			releaseStableFrame(peekedFrame);
		}

		lastReturnedFrame = null;
		peekedFrame = null;
		iterator.closeIterator().catch(() => undefined);
	};

	const tryToSatisfySeek = async (
		time: number,
	): Promise<
		| {
				type: 'not-satisfied';
				reason: string;
		  }
		| {
				type: 'satisfied';
				frame: WrappedCanvas;
		  }
	> => {
		const timestamp = roundTo4Digits(time);
		if (lastReturnedFrame) {
			const frameTimestamp = roundTo4Digits(lastReturnedFrame.timestamp);

			if (timestamp < frameTimestamp) {
				const lastFrameWasInitialFrame = lastReturnedFrame === initialFrame;
				const firstFrameDoesSatisfy =
					lastFrameWasInitialFrame &&
					roundTo4Digits(time) >= roundTo4Digits(timeToSeek);

				if (firstFrameDoesSatisfy) {
					return {
						type: 'satisfied' as const,
						frame: lastReturnedFrame,
					};
				}

				return {
					type: 'not-satisfied' as const,
					reason: `iterator is too far, most recently returned ${frameTimestamp}`,
				};
			}

			const frameEndTimestamp = await getFrameEndTimestamp();

			if (frameTimestamp <= timestamp && frameEndTimestamp > timestamp) {
				return {
					type: 'satisfied' as const,
					frame: lastReturnedFrame,
				};
			}
		}

		if (iteratorEnded) {
			if (lastReturnedFrame) {
				return {
					type: 'satisfied' as const,
					frame: lastReturnedFrame,
				};
			}

			return {
				type: 'not-satisfied' as const,
				reason: 'iterator ended',
			};
		}

		while (true) {
			const frame = getNextOrNullIfNotAvailable();

			if (frame.type === 'need-to-wait-for-it') {
				return {
					type: 'not-satisfied' as const,
					reason: 'iterator did not have frame ready',
				};
			}

			if (frame.type === 'got-frame-or-end') {
				if (frame.frame === null) {
					iteratorEnded = true;
					if (lastReturnedFrame) {
						return {
							type: 'satisfied' as const,
							frame: lastReturnedFrame,
						};
					}

					return {
						type: 'not-satisfied' as const,
						reason: 'iterator ended and did not have frame ready',
					};
				}

				const frameTimestamp = roundTo4Digits(frame.frame.timestamp);
				const frameEndTimestamp = await getFrameEndTimestampIfCloseEnough({
					frameTimestamp,
					timestamp,
				});
				if (frameEndTimestamp.type === 'pending') {
					return {
						type: 'not-satisfied' as const,
						reason: 'iterator did not have next frame ready',
					};
				}

				if (
					frameTimestamp <= timestamp &&
					frameEndTimestamp.timestamp > timestamp
				) {
					return {
						type: 'satisfied' as const,
						frame: frame.frame,
					};
				}

				continue;
			}

			throw new Error('Unreachable');
		}
	};

	return {
		destroy,
		initialFrame,
		isDestroyed: () => {
			return destroyed;
		},
		tryToSatisfySeek,
	};
};

export type VideoIterator = Awaited<ReturnType<typeof createVideoIterator>>;
