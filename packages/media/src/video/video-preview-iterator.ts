import type {WrappedCanvas} from 'mediabunny';
import {roundTo4Digits} from '../helpers/round-to-4-digits';
import type {PrewarmedVideoIteratorCache} from '../prewarm-iterator-for-looping';

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

	const getNextOrNullIfNotAvailable = () => {
		const next = iterator.next();

		if (next.type === 'pending') {
			return {
				type: 'need-to-wait-for-it' as const,
				waitPromise: async () => {
					const res = await next.wait();
					if (res) {
						lastReturnedFrame = res;
					} else {
						iteratorEnded = true;
					}

					return res;
				},
			};
		}

		if (next.frame) {
			lastReturnedFrame = next.frame;
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
		lastReturnedFrame = null;
		iterator.closeIterator().catch(() => undefined);
	};

	const tryToSatisfySeek = (
		time: number,
	):
		| {
				type: 'not-satisfied';
				reason: string;
		  }
		| {
				type: 'satisfied';
				frame: WrappedCanvas;
		  } => {
		if (lastReturnedFrame) {
			const frameTimestamp = roundTo4Digits(lastReturnedFrame.timestamp);

			if (roundTo4Digits(time) < frameTimestamp) {
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

			const frameEndTimestamp = roundTo4Digits(
				lastReturnedFrame.timestamp + lastReturnedFrame.duration,
			);
			const timestamp = roundTo4Digits(time);
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
				const frameEndTimestamp = roundTo4Digits(
					frame.frame.timestamp + frame.frame.duration,
				);
				const timestamp = roundTo4Digits(time);
				if (frameTimestamp <= timestamp && frameEndTimestamp > timestamp) {
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
