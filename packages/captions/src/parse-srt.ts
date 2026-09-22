import type {Caption} from './caption';

function toMilliseconds(time: string) {
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

	const [seconds, millis] = third.trim().split(/[,.]/);
	if (!seconds) {
		throw new Error(`Invalid timestamp:${time}`);
	}

	if (!millis) {
		throw new Error(`Invalid timestamp:${time}`);
	}

	return (
		parseInt(first, 10) * 3600000 +
		parseInt(second, 10) * 60000 +
		parseInt(seconds, 10) * 1000 +
		parseInt(millis, 10)
	);
}

export type ParseSrtInput = {
	input: string;
};

export type ParseSrtOutput = {
	captions: Caption[];
};

export const parseSrt = ({input}: ParseSrtInput): ParseSrtOutput => {
	const inputLines = input
		.replace(/^\uFEFF/, '')
		.replace(/\r\n/g, '\n')
		.replace(/\r/g, '\n')
		.split('\n');
	const captions: Caption[] = [];

	for (let i = 0; i < inputLines.length; i++) {
		const line = inputLines[i];
		const nextLine = inputLines[i + 1];
		if (line?.match(/^\s*\d+\s*$/) && nextLine?.includes(' --> ')) {
			const nextLineSplit = nextLine.split(' --> ');
			const start = toMilliseconds((nextLineSplit[0] as string).trim());
			const end = toMilliseconds((nextLineSplit[1] as string).trim());
			captions.push({
				text: '',
				startMs: start,
				endMs: end,
				confidence: 1,
				timestampMs: (start + end) / 2,
			});
			i++;
		} else if (line?.trim() === '') {
			if (captions.length > 0) {
				(captions[captions.length - 1] as Caption).text = (
					captions[captions.length - 1] as Caption
				).text.trim();
			}
		} else if (captions.length > 0) {
			(captions[captions.length - 1] as Caption).text += line + '\n';
		}
	}

	return {
		captions: captions.map((l) => {
			return {
				...l,
				text: l.text.trimEnd(),
			};
		}),
	};
};
