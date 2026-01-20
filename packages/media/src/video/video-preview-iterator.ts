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

	const initialFrame = (await iterator.next())?.value ?? null;
	let lastReturnedFrame = initialFrame;

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
					if (res.value) {
						lastReturnedFrame = res.value;
					} else {
						iteratorEnded = true;
					}

					return res.value;
				},
			};
		}

		if (result.value) {
			lastReturnedFrame = result.value;
		} else {
			iteratorEnded = true;
		}

		return {
			type: 'got-frame-or-end' as const,
			frame: result.value ?? null,
		};
	};

	const destroy = () => {
		destroyed = true;
		lastReturnedFrame = null;
		iterator.return().catch(() => undefined);
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
			const frame = await getNextOrNullIfNotAvailable();
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
