import {
	getIdealMaximumFrameCacheItems,
	startLongRunningCompositor,
} from './compositor/compositor';
import type {SilentParts} from './compositor/payloads';
import type {LogLevel} from './log-level';

export const getSilentParts = async ({
	src,
	noiseThresholdInDecibel: passednoiseThresholdInDecibel,
	minDuration: passedMinDuration,
	logLevel,
}: {
	src: string;
	minDuration?: number;
	logLevel?: LogLevel;
	noiseThresholdInDecibel?: number;
}): Promise<SilentParts> => {
	const compositor = startLongRunningCompositor(
		getIdealMaximumFrameCacheItems(),
		logLevel ?? 'info',
		false
	);

	const minDuration = passedMinDuration ?? 1;

	if (typeof minDuration !== 'number') {
		throw new Error(`minDuration must be a number, but was ${minDuration}`);
	}

	if (minDuration <= 0) {
		throw new Error(
			`minDuration must be greater than 0, but was ${minDuration}`
		);
	}

	const noiseThresholdInDecibel = passednoiseThresholdInDecibel ?? -20;

	if (typeof noiseThresholdInDecibel !== 'number') {
		throw new Error(
			`noiseThresholdInDecibel must be a number, but was ${noiseThresholdInDecibel}`
		);
	}

	if (noiseThresholdInDecibel >= 30) {
		throw new Error(
			`noiseThresholdInDecibel must be less than 0, but was ${noiseThresholdInDecibel}`
		);
	}

	const res = await compositor.executeCommand('GetSilences', {
		src,
		minDuration,
		noiseThresholdInDecibel,
	});
	console.log(res);
	const response = JSON.parse(res.toString('utf-8')) as SilentParts;

	compositor.finishCommands();
	await compositor.waitForDone();
	return response;
};
