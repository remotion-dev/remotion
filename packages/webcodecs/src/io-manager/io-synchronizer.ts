import {IoEventEmitter} from '../create/event-emitter';
import {withResolvers} from '../create/with-resolvers';
import type {LogLevel} from '../log';
import {Log} from '../log';
import type {WebCodecsController} from '../webcodecs-controller';
import {makeTimeoutPromise} from './make-timeout-promise';

export const makeIoSynchronizer = ({
	logLevel,
	label,
	controller,
}: {
	logLevel: LogLevel;
	label: string;
	controller: WebCodecsController | null;
}) => {
	const eventEmitter = new IoEventEmitter();

	let lastInput = 0;
	let lastOutput = 0;
	let inputsSinceLastOutput = 0;
	let inputs: number[] = [];

	const getQueuedItems = () => {
		inputs = inputs.filter(
			(input) => Math.floor(input) > Math.floor(lastOutput),
		);
		return inputs.length;
	};

	const printState = (prefix: string) => {
		Log.trace(
			logLevel,
			`[${label}] ${prefix}, state: Last input = ${lastInput} Last output = ${lastOutput} Inputs since last output = ${inputsSinceLastOutput}, Queue = ${getQueuedItems()}`,
		);
	};

	const inputItem = (timestamp: number) => {
		lastInput = timestamp;

		inputsSinceLastOutput++;
		inputs.push(timestamp);

		eventEmitter.dispatchEvent('input', {
			timestamp,
		});
		printState('Input item');
	};

	const onOutput = (timestamp: number) => {
		lastOutput = timestamp;
		inputsSinceLastOutput = 0;
		eventEmitter.dispatchEvent('output', {
			timestamp,
		});

		printState('Got output');
	};

	const waitForOutput = () => {
		const {promise, resolve} = withResolvers<void>();
		const on = () => {
			eventEmitter.removeEventListener('output', on);
			resolve();
		};

		eventEmitter.addEventListener('output', on);
		return promise;
	};

	const makeErrorBanner = () => {
		return [
			`Waited too long for ${label} to finish:`,
			`${getQueuedItems()} queued items`,
			`inputs: ${JSON.stringify(inputs)}`,
			`last output: ${lastOutput}`,
		];
	};

	const waitForQueueSize = async (queueSize: number) => {
		const {timeoutPromise, clear} = makeTimeoutPromise({
			label: () =>
				[
					...makeErrorBanner(),
					`wanted: <${queueSize} queued items`,
					`Report this at https://remotion.dev/report`,
				].join('\n'),
			ms: 10000,
			controller,
		});

		if (controller) {
			controller._internals._mediaParserController._internals.signal.addEventListener(
				'abort',
				clear,
			);
		}

		await Promise.race([
			timeoutPromise,
			(async () => {
				while (getQueuedItems() > queueSize) {
					await waitForOutput();
				}
			})(),
		]).finally(() => clear());

		if (controller) {
			controller._internals._mediaParserController._internals.signal.removeEventListener(
				'abort',
				clear,
			);
		}
	};

	const waitForFinish = async () => {
		await waitForQueueSize(0);
	};

	return {
		inputItem,
		onOutput,
		waitForFinish,
		waitForQueueSize,
	};
};

export type IoSynchronizer = ReturnType<typeof makeIoSynchronizer>;
