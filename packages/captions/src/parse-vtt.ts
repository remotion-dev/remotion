import type {Caption} from './caption';

const parseVttTimestamp = (time: string): number => {
	const parts = time.trim().split(':');
	if (parts.length < 2 || parts.length > 3) {
		throw new Error(`Invalid timestamp:${time}`);
	}

	const hours = parts.length === 3 ? parts[0] : '0';
	const minutes = parts.length === 3 ? parts[1] : parts[0];
	const [seconds, millis] = (parts.length === 3 ? parts[2] : parts[1]).split(
		/[,.]/,
	);

	if (!hours || !minutes || !seconds || !millis) {
		throw new Error(`Invalid timestamp:${time}`);
	}

	return (
		parseInt(hours, 10) * 3600000 +
		parseInt(minutes, 10) * 60000 +
		parseInt(seconds, 10) * 1000 +
		parseInt(millis, 10)
	);
};

const namedCharacterReferences = new Map<string, string>([
	['amp', '&'],
	['lt', '<'],
	['gt', '>'],
	['quot', '"'],
	['apos', "'"],
	['nbsp', '\u00A0'],
	['lrm', '\u200E'],
	['rlm', '\u200F'],
]);

// Cue text must escape `&` and `<` as character references,
// so they need to be decoded to get the plain text.
const decodeCharacterReferences = (text: string): string => {
	return text.replace(
		/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g,
		(match, reference: string) => {
			if (reference.startsWith('#')) {
				const isHex = reference[1] === 'x' || reference[1] === 'X';
				const codePoint = isHex
					? parseInt(reference.slice(2), 16)
					: parseInt(reference.slice(1), 10);
				if (
					codePoint === 0 ||
					codePoint > 0x10ffff ||
					(codePoint >= 0xd800 && codePoint <= 0xdfff)
				) {
					return match;
				}

				return String.fromCodePoint(codePoint);
			}

			return namedCharacterReferences.get(reference) ?? match;
		},
	);
};

export type ParseVttInput = {
	input: string;
};

export type ParseVttOutput = {
	captions: Caption[];
};

export const parseVtt = ({input}: ParseVttInput): ParseVttOutput => {
	const inputLines = input
		.replace(/^\uFEFF/, '')
		.replace(/\r\n/g, '\n')
		.replace(/\r/g, '\n')
		.split('\n');
	const captions: Caption[] = [];

	let i = 0;

	// The file starts with a `WEBVTT` header, optionally followed by trailing
	// text on the same line.
	if (inputLines[i]?.trim().startsWith('WEBVTT')) {
		i++;
	}

	while (i < inputLines.length) {
		const line = inputLines[i];

		if (line.trim() === '') {
			i++;
			continue;
		}

		// NOTE, STYLE and REGION blocks are not cues and span until the next
		// blank line.
		if (/^(NOTE|STYLE|REGION)(\s|$)/.test(line)) {
			i++;
			while (i < inputLines.length && inputLines[i].trim() !== '') {
				i++;
			}

			continue;
		}

		const arrowIndex = line.indexOf('-->');
		if (arrowIndex === -1) {
			// An optional cue identifier. Skip it and read the timing line next.
			i++;
			continue;
		}

		const startToken = line.slice(0, arrowIndex).trim();
		const endToken = line
			.slice(arrowIndex + '-->'.length)
			.trim()
			.split(/\s+/)[0];

		const startMs = parseVttTimestamp(startToken);
		const endMs = parseVttTimestamp(endToken);

		i++;
		const text: string[] = [];
		while (i < inputLines.length && inputLines[i].trim() !== '') {
			text.push(inputLines[i]);
			i++;
		}

		captions.push({
			text: decodeCharacterReferences(text.join('\n').trimEnd()),
			startMs,
			endMs,
			timestampMs: (startMs + endMs) / 2,
			confidence: 1,
		});
	}

	return {captions};
};
