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
	strict?: boolean;
};

export type ParseSrtOutput = {
	captions: Caption[];
};

export const parseSrt = ({
	input,
	strict = false,
}: ParseSrtInput): ParseSrtOutput => {
	const inputLines = input
		.replace(/^\uFEFF/, '')
		.replace(/\r\n/g, '\n')
		.replace(/\r/g, '\n')
		.split('\n');
	const captions: Caption[] = [];

	if (strict) {
		const timestamp = (token: string, cue: number, line: number): number => {
			const match = /^(\d+):(\d{2}):(\d{2})[,.](\d{3})$/.exec(token);
			if (!match || Number(match[2]) > 59 || Number(match[3]) > 59) {
				throw new Error(
					`SRT cue ${cue}, line ${line}: invalid timestamp "${token}". Use HH:MM:SS,mmm.`,
				);
			}

			const value =
				Number(match[1]) * 3600000 +
				Number(match[2]) * 60000 +
				Number(match[3]) * 1000 +
				Number(match[4]);
			if (!Number.isFinite(value)) {
				throw new Error(
					`SRT cue ${cue}, line ${line}: timestamp is too large.`,
				);
			}

			return value;
		};

		let i = 0;
		while (i < inputLines.length) {
			if (inputLines[i].trim() === '') {
				i++;
				continue;
			}

			const cue = captions.length + 1;
			const headerLine = i + 1;
			if (!/^\d+$/.test(inputLines[i].trim())) {
				throw new Error(
					`SRT cue ${cue}, line ${headerLine}: expected a numeric cue index.`,
				);
			}

			i++;
			const timingLine = inputLines[i];
			const timing = timingLine?.match(/^\s*(\S+)\s+-->\s+(\S+)\s*$/);
			if (!timing) {
				throw new Error(
					`SRT cue ${cue}, line ${i + 1}: expected start --> end timestamps.`,
				);
			}

			const startMs = timestamp(timing[1], cue, i + 1);
			const endMs = timestamp(timing[2], cue, i + 1);
			if (endMs < startMs) {
				throw new Error(
					`SRT cue ${cue}, line ${i + 1}: end must not be earlier than start.`,
				);
			}

			i++;
			const text: string[] = [];
			while (i < inputLines.length && inputLines[i].trim() !== '') {
				text.push(inputLines[i]);
				i++;
			}

			if (text.length === 0) {
				throw new Error(`SRT cue ${cue}, line ${i + 1}: expected cue text.`);
			}

			captions.push({
				text: text.join('\n').trimEnd(),
				startMs,
				endMs,
				timestampMs: (startMs + endMs) / 2,
				confidence: 1,
			});
		}

		if (captions.length === 0) {
			throw new Error(
				'SRT: No timed captions found. Provide numbered cues with timestamps and text.',
			);
		}

		return {captions};
	}

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
