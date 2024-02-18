import type {LogLevel} from '@remotion/renderer';
import type {VideoConfig} from 'remotion';
import {Log} from './log';
import {quietFlagProvided} from './parse-command-line';

const max = (arr: number[]) => {
	if (arr.length === 0) {
		throw new Error('Array of 0 length');
	}

	let biggest = arr[0];
	for (let i = 0; i < arr.length; i++) {
		const elem = arr[i];
		if (elem > biggest) {
			biggest = elem;
		}
	}

	return biggest;
};

export const printCompositions = (
	compositions: VideoConfig[],
	logLevel: LogLevel,
) => {
	if (!quietFlagProvided()) {
		Log.infoAdvanced({indent: false, logLevel});
		Log.infoAdvanced(
			{indent: false, logLevel},
			'The following compositions are available:',
		);
		Log.infoAdvanced({indent: false, logLevel});
	}

	if (quietFlagProvided()) {
		Log.infoAdvanced(
			{indent: false, logLevel},
			compositions.map((c) => c.id).join(' '),
		);
		return;
	}

	const firstColumnLength = max(compositions.map(({id}) => id.length)) + 4;
	const secondColumnLength = 8;
	const thirdColumnLength = 15;

	Log.infoAdvanced(
		{indent: false, logLevel},
		compositions
			.map((comp) => {
				const isStill = comp.durationInFrames === 1;
				const dimensions = `${comp.width}x${comp.height}`;
				const fps = isStill ? '' : comp.fps.toString();
				const durationInSeconds = (comp.durationInFrames / comp.fps).toFixed(2);
				const formattedDuration = isStill
					? 'Still'
					: `${comp.durationInFrames} (${durationInSeconds} sec)`;
				return [
					comp.id.padEnd(firstColumnLength, ' '),
					fps.padEnd(secondColumnLength, ' '),
					dimensions.padEnd(thirdColumnLength, ' '),
					formattedDuration,
				].join('');
			})
			.join('\n'),
	);
};
