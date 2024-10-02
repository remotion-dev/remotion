import {Caption} from './captions';

function toSeconds(time: string) {
	const [first, second, third] = time.split(':');
	if (!first) {
		throw new Error(`Invalid timestamp:${time}`);
	}
	if (!second) {
		throw new Error(`Invalid timestamp:${time}`);
	}
	if (!third) {
		throw new Error(`Invalid timestamp:${time}`);
	}

	const [seconds, millis] = third.split(',');
	if (!seconds) {
		throw new Error(`Invalid timestamp:${time}`);
	}
	if (!millis) {
		throw new Error(`Invalid timestamp:${time}`);
	}

	return (
		parseInt(first, 10) * 3600 +
		parseInt(second, 10) * 60 +
		parseInt(seconds, 10) +
		parseInt(millis, 10) / 1000
	);
}

export type ParseSrtInput = {
	input: string;
};

export type ParseSrtOutput = {
	lines: Caption[];
};

export const parseSrt = ({input}: ParseSrtInput): ParseSrtOutput => {
	const inputLines = input.split('\n');
	const lines: Caption[] = [];

	for (let i = 0; i < inputLines.length; i++) {
		const line = inputLines[i];
		const nextLine = inputLines[i + 1];
		if (line?.match(/([0-9]+)/) && nextLine?.includes(' --> ')) {
			const nextLineSplit = nextLine.split(' --> ');
			const start = toSeconds(nextLineSplit[0] as string);
			const end = toSeconds(nextLineSplit[1] as string);
			lines.push({
				text: '',
				startMs: start * 1000,
				endMs: end * 1000,
				confidence: 1,
				timestampMs: ((start + end) / 2) * 1000,
			});
		} else if (line?.includes(' --> ')) {
			continue;
		} else if (line?.trim() === '') {
			(lines[lines.length - 1] as Caption).text = (
				lines[lines.length - 1] as Caption
			).text.trim();
		} else {
			(lines[lines.length - 1] as Caption).text += line + '\n';
		}
	}

	return {
		lines: lines.map((l) => {
			return {
				...l,
				text: l.text.trimEnd(),
			};
		}),
	};
};
