import type {LogLevel} from '../log';
import {Log} from '../log';
import {withResolvers} from '../with-resolvers';
import {IoEventEmitter} from './event-emitter';

export const makeIoSynchronizer = (logLevel: LogLevel, label: string) => {
	const eventEmitter = new IoEventEmitter();

	let lastInput = 0;
	let lastInputKeyframe = 0;
	let lastOutput = 0;
	let inputsSinceLastOutput = 0;
	let inputs: number[] = [];
	let keyframes: number[] = [];

	// Once WebCodecs emits items, the user has to handle them
	// Let's keep count of how many items are unprocessed
	let unprocessed = 0;

	const getUnprocessed = () => unprocessed;

	const getUnemittedItems = () => {
		inputs = inputs.filter((input) => input > lastOutput);
		return inputs.length;
	};

	const getUnemittedKeyframes = () => {
		keyframes = keyframes.filter((keyframe) => keyframe > lastOutput);
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
		unprocessed++;
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
		_unprocessed,
		unemitted,
	}: {
		unemitted: number;
		_unprocessed: number;
	}) => {
		while (getUnemittedItems() > unemitted) {
			await waitForOutput();
		}

		while (getUnprocessed() > _unprocessed) {
			await waitForProcessed();
		}
	};

	const waitForFinish = async () => {
		await waitFor({_unprocessed: 0, unemitted: 0});
	};

	const onProcessed = () => {
		eventEmitter.dispatchEvent('processed', {});
		unprocessed--;
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
