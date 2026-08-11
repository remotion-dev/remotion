import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import type {LogLevel} from './log';
import type {WebCodecsController} from './webcodecs-controller';

type Processable =
	| EncodedAudioChunk
	| EncodedVideoChunk
	| AudioData
	| VideoFrame;

export function processingQueue<T extends Processable>({
	onOutput,
	logLevel,
	label,
	onError,
	controller,
}: {
	onOutput: (item: T) => Promise<void>;
	onError: (error: Error) => void;
	logLevel: LogLevel;
	label: string;
	controller: WebCodecsController;
}) {
	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label,
		controller,
	});

	let queue = Promise.resolve();
	let stopped = false;

	const input = (item: T) => {
		if (stopped) {
			return;
		}

		if (
			controller._internals._mediaParserController._internals.signal.aborted
		) {
			stopped = true;
			return;
		}

		const {timestamp} = item; // Saving in variable, because timestamp might become nulled

		ioSynchronizer.inputItem(timestamp);

		queue = queue
			.then(() => {
				if (stopped) {
					return;
				}

				if (
					controller._internals._mediaParserController._internals.signal.aborted
				) {
					stopped = true;
					return;
				}

				return onOutput(item);
			})
			.then(() => {
				ioSynchronizer.onOutput(timestamp);
				return Promise.resolve();
			})
			.catch((err) => {
				stopped = true;
				onError(err);
			});
	};

	return {
		input,
		ioSynchronizer,
	};
}
