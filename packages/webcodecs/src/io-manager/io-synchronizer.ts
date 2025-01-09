import {IoEventEmitter} from '../create/event-emitter';
import type {ProgressTracker} from '../create/progress-tracker';
import {withResolvers} from '../create/with-resolvers';
import type {LogLevel} from '../log';
import {Log} from '../log';
import {makeTimeoutPromise} from './make-timeout-promise';

export const makeIoSynchronizer = ({
	logLevel,
	label,
	progress,
}: {
	logLevel: LogLevel;
	label: string;
	progress: ProgressTracker;
}) => {
	const eventEmitter = new IoEventEmitter();

	let lastInput = 0;
	let lastInputKeyframe = 0;
	let lastOutput = 0;
	let inputsSinceLastOutput = 0;
	let inputs: number[] = [];
	let keyframes: number[] = [];

	// Once WebCodecs emits items, the user has to handle them
	// Let's keep count of how many items are unprocessed
	let _unprocessed = 0;

	const getUnprocessed = () => _unprocessed;

	const getUnemittedItems = () => {
		inputs = inputs.filter(
			(input) => Math.floor(input) > Math.floor(lastOutput),
		);
		return inputs.length;
	};

	const getUnemittedKeyframes = () => {
		keyframes = keyframes.filter(
			(keyframe) => Math.floor(keyframe) > Math.floor(lastOutput),
		);
		return keyframes.length;
	};

	const printState = (prefix: string) => {
		Log.trace(
			logLevel,
			`[${label}] ${prefix}, state: Last input = ${lastInput} Last input keyframe = ${lastInputKeyframe} Last output = ${lastOutput} Inputs since last output = ${inputsSinceLastOutput}, Queue = ${getUnemittedItems()} (${getUnemittedKeyframes()} keyframes), Unprocessed = ${getUnprocessed()}`,
		);
	};

	const inputItem = (timestamp: number, keyFrame: boolean) => {
		lastInput = timestamp;
		if (keyFrame) {
			lastInputKeyframe = timestamp;
			keyframes.push(timestamp);
		}

		inputsSinceLastOutput++;
		inputs.push(timestamp);

		eventEmitter.dispatchEvent('input', {
			timestamp,
			keyFrame,
		});
		printState('Input item');
	};

	const onOutput = (timestamp: number) => {
		lastOutput = timestamp;
		inputsSinceLastOutput = 0;
		eventEmitter.dispatchEvent('output', {
			timestamp,
		});
		_unprocessed++;

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

	const waitForProcessed = () => {
		const {promise, resolve} = withResolvers<void>();
		const on = () => {
			eventEmitter.removeEventListener('processed', on);
			resolve();
		};

		eventEmitter.addEventListener('processed', on);
		return promise;
	};

	const waitFor = async ({
		unprocessed,
		unemitted,
		minimumProgress,
		signal,
	}: {
		unemitted: number;
		unprocessed: number;
		minimumProgress: number | null;
		signal: AbortSignal;
	}) => {
		const {timeoutPromise, clear} = makeTimeoutPromise(
			() =>
				[
					`Waited too long for ${label} to finish:`,
					`${getUnemittedItems()} unemitted items`,
					`${getUnprocessed()} unprocessed items: ${JSON.stringify(_unprocessed)}`,
					`smallest progress: ${progress.getSmallestProgress()}`,
					`inputs: ${JSON.stringify(inputs)}`,
					`last output: ${lastOutput}`,
					`wanted: ${unemitted} unemitted items, ${unprocessed} unprocessed items, minimum progress ${minimumProgress}`,
				].join('\n'),
			10_000,
		);
		signal.addEventListener('abort', clear);

		await Promise.race([
			timeoutPromise,
			Promise.all([
				(async () => {
					while (getUnemittedItems() > unemitted) {
						await waitForOutput();
					}
				})(),
				(async () => {
					while (getUnprocessed() > unprocessed) {
						await waitForProcessed();
					}
				})(),
				minimumProgress === null || progress.getSmallestProgress() === null
					? Promise.resolve()
					: (async () => {
							while (progress.getSmallestProgress() < minimumProgress) {
								await progress.waitForProgress();
							}
						})(),
			]),
		]).finally(() => clear());
		signal.removeEventListener('abort', clear);
	};

	const waitForFinish = async (signal: AbortSignal) => {
		await waitFor({
			unprocessed: 0,
			unemitted: 0,
			minimumProgress: null,
			signal,
		});
	};

	const onProcessed = () => {
		eventEmitter.dispatchEvent('processed', {});
		_unprocessed--;
	};

	return {
		inputItem,
		onOutput,
		waitFor,
		waitForFinish,
		onProcessed,
		getUnprocessed,
	};
};
