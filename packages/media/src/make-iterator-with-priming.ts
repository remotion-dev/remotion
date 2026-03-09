import type {AudioBufferSink, WrappedAudioBuffer} from 'mediabunny';

const AUDIO_PRIMING_SECONDS = 0.5;
const PREDECODE_AHEAD_SECONDS = 8;

function makePredecodingIterator(
	inner: AsyncGenerator<WrappedAudioBuffer, void, unknown>,
): AsyncGenerator<WrappedAudioBuffer, void, unknown> {
	const buffer: WrappedAudioBuffer[] = [];
	let consumerEndTime = 0;
	let innerDone = false;
	let returned = false;
	let fetching = false;
	let waiter:
		| ((result: IteratorResult<WrappedAudioBuffer, void>) => void)
		| null = null;

	const prefetch = () => {
		if (fetching || returned || innerDone) {
			return;
		}

		const lastBuffered = buffer.length > 0 ? buffer[buffer.length - 1] : null;
		const bufferedEndTime = lastBuffered
			? lastBuffered.timestamp + lastBuffered.duration
			: consumerEndTime;

		if (bufferedEndTime >= consumerEndTime + PREDECODE_AHEAD_SECONDS) {
			return;
		}

		fetching = true;
		inner.next().then(
			(result) => {
				fetching = false;
				if (returned) {
					return;
				}

				if (result.done) {
					innerDone = true;
					if (waiter) {
						const w = waiter;
						waiter = null;
						w({value: undefined, done: true});
					}

					return;
				}

				if (waiter) {
					const w = waiter;
					waiter = null;
					const buf = result.value;
					consumerEndTime = buf.timestamp + buf.duration;
					w({value: buf, done: false});
					prefetch();
					return;
				}

				buffer.push(result.value);
				prefetch();
			},
			() => {
				fetching = false;
				innerDone = true;
				if (waiter) {
					const w = waiter;
					waiter = null;
					w({value: undefined, done: true});
				}
			},
		);
	};

	prefetch();

	const _return = () => {
		returned = true;
		buffer.length = 0;
		if (waiter) {
			const w = waiter;
			waiter = null;
			w({value: undefined, done: true});
		}

		inner.return(undefined);
		return Promise.resolve({value: undefined, done: true as const});
	};

	const iterator = {
		next() {
			if (buffer.length > 0) {
				const buf = buffer.shift()!;
				consumerEndTime = buf.timestamp + buf.duration;
				prefetch();
				return Promise.resolve({value: buf, done: false as const});
			}

			if (innerDone) {
				return Promise.resolve({
					value: undefined,
					done: true as const,
				});
			}

			return new Promise((resolve) => {
				waiter = resolve;
				prefetch();
			});
		},
		return: _return,
		throw(e) {
			returned = true;
			buffer.length = 0;
			return inner.throw(e);
		},
		[Symbol.asyncIterator]() {
			return iterator;
		},
	} as AsyncGenerator<WrappedAudioBuffer, void, unknown>;

	return iterator;
}

async function* makeIteratorWithPrimingInner(
	audioSink: AudioBufferSink,
	timeToSeek: number,
	maximumTimestamp: number,
): AsyncGenerator<WrappedAudioBuffer, void, unknown> {
	const primingStart = Math.max(0, timeToSeek - AUDIO_PRIMING_SECONDS);
	const iterator = audioSink.buffers(primingStart, maximumTimestamp);

	for await (const buffer of iterator) {
		if (buffer.timestamp + buffer.duration <= timeToSeek) {
			continue;
		}

		yield buffer;
	}
}

export const makeIteratorWithPriming = ({
	audioSink,
	timeToSeek,
	maximumTimestamp,
}: {
	audioSink: AudioBufferSink;
	timeToSeek: number;
	maximumTimestamp: number;
}): AsyncGenerator<WrappedAudioBuffer, void, unknown> => {
	return makePredecodingIterator(
		makeIteratorWithPrimingInner(audioSink, timeToSeek, maximumTimestamp),
	);
};
