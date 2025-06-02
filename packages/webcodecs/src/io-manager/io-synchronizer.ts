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
	let resolvers: ((value: void | PromiseLike<void>) => void)[] = [];

	const getQueuedItems = () => {
		inputs = inputs.filter(
			// In chrome, the last output sometimes shifts the timestamp by 1 macrosecond - allowing this to happen
			(input) => Math.floor(input) > Math.floor(lastOutput) + 1,
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
			resolvers = resolvers.filter((resolver) => resolver !== resolve);
		};

		eventEmitter.addEventListener('output', on);
		resolvers.push(resolve);
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
		if (getQueuedItems() <= queueSize) {
			return Promise.resolve();
		}

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

	const clearQueue = () => {
		inputs.length = 0;
		lastInput = 0;
		lastOutput = 0;
		inputsSinceLastOutput = 0;

		resolvers.forEach((resolver) => {
			return resolver();
		});
		resolvers.length = 0;

		inputs.length = 0;
	};

	return {
		inputItem,
		onOutput,
		waitForQueueSize,
		clearQueue,
	};
};

export type IoSynchronizer = ReturnType<typeof makeIoSynchronizer>;
