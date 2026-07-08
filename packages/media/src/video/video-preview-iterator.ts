import type {WrappedCanvas} from 'mediabunny';
import {releaseStableFrame} from '../canvas-ahead-of-time';
import {roundTo4Digits} from '../helpers/round-to-4-digits';
import type {PrewarmedVideoIteratorCache} from '../prewarm-iterator-for-looping';

const MAX_FUTURE_FRAME_DISTANCE_IN_SECONDS = 0.003;
const MAX_FUTURE_FRAME_DISTANCE_RATIO = 0.1;

const shouldUseNextFrameForTimestamp = ({
	time,
	previousFrame,
	nextFrame,
}: {
	time: number;
	previousFrame: WrappedCanvas;
	nextFrame: WrappedCanvas;
}) => {
	const mediaFrameDuration = nextFrame.timestamp - previousFrame.timestamp;

	if (mediaFrameDuration <= 0) {
		return false;
	}

	const nextDistance = nextFrame.timestamp - time;
	const previousDistance = time - previousFrame.timestamp;

	if (nextDistance <= 0 || previousDistance < 0) {
		return false;
	}

	return (
		nextDistance < previousDistance &&
		nextDistance <= MAX_FUTURE_FRAME_DISTANCE_IN_SECONDS &&
		nextDistance <= mediaFrameDuration * MAX_FUTURE_FRAME_DISTANCE_RATIO
	);
};

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

	const peek = async () => {
		if (peekedFrame) {
			return peekedFrame;
		}

		const next = iterator.next();
		if (next.type === 'ready') {
			peekedFrame = next.frame;
		} else {
			peekedFrame = await next.wait();
		}

		return peekedFrame;
	};

	const getNextOrNullIfNotAvailable = () => {
		if (peekedFrame) {
			const frame = peekedFrame;
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
				waitPromise: next.wait,
			};
		}

		if (!next.frame) {
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
		const chooseBetweenPreviousAndNext = (nextFrame: WrappedCanvas) => {
			if (!lastReturnedFrame) {
				setLastReturnedFrame(nextFrame);
				return nextFrame;
			}

			const selectedFrame = shouldUseNextFrameForTimestamp({
				time,
				previousFrame: lastReturnedFrame,
				nextFrame,
			})
				? nextFrame
				: lastReturnedFrame;

			if (selectedFrame === nextFrame) {
				setLastReturnedFrame(nextFrame);
				if (peekedFrame === nextFrame) {
					peekedFrame = null;
				}
			}

			return selectedFrame;
		};

		if (lastReturnedFrame) {
			const frameTimestamp = roundTo4Digits(lastReturnedFrame.timestamp);

			if (time + Number.EPSILON < lastReturnedFrame.timestamp) {
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

			let lastFrameDuration = lastReturnedFrame.duration;
			if (lastFrameDuration === 0) {
				const peeked = await peek();
				if (peeked) {
					lastFrameDuration = peeked.timestamp - lastReturnedFrame.timestamp;
				}
			}

			const frameEndTimestamp = roundTo4Digits(
				lastReturnedFrame.timestamp + lastFrameDuration,
			);

			if (frameTimestamp <= timestamp && frameEndTimestamp > timestamp) {
				const shouldCheckNextFrame =
					lastReturnedFrame.duration > 0 &&
					time - lastReturnedFrame.timestamp >= lastFrameDuration / 2;

				if (!shouldCheckNextFrame) {
					return {
						type: 'satisfied' as const,
						frame: lastReturnedFrame,
					};
				}

				const nextFrame = await peek();
				if (!nextFrame) {
					iteratorEnded = true;
					return {
						type: 'satisfied' as const,
						frame: lastReturnedFrame,
					};
				}

				if (nextFrame.timestamp > time + Number.EPSILON) {
					return {
						type: 'satisfied' as const,
						frame: chooseBetweenPreviousAndNext(nextFrame),
					};
				}
			} else if (frameTimestamp <= timestamp) {
				const nextFrame = await peek();
				if (!nextFrame) {
					iteratorEnded = true;
					return {
						type: 'satisfied' as const,
						frame: lastReturnedFrame,
					};
				}

				if (nextFrame.timestamp > time + Number.EPSILON) {
					return {
						type: 'satisfied' as const,
						frame: chooseBetweenPreviousAndNext(nextFrame),
					};
				}
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
			const nextFrame =
				frame.type === 'need-to-wait-for-it'
					? await frame.waitPromise()
					: frame.frame;

			if (nextFrame === null) {
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

			const frameTimestamp = roundTo4Digits(nextFrame.timestamp);
			if (nextFrame.timestamp > time + Number.EPSILON && lastReturnedFrame) {
				peekedFrame = nextFrame;
				return {
					type: 'satisfied' as const,
					frame: chooseBetweenPreviousAndNext(nextFrame),
				};
			}

			const frameEndTimestamp = roundTo4Digits(
				nextFrame.timestamp + nextFrame.duration,
			);
			setLastReturnedFrame(nextFrame);
			if (frameTimestamp <= timestamp && frameEndTimestamp > timestamp) {
				return {
					type: 'satisfied' as const,
					frame: nextFrame,
				};
			}
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
