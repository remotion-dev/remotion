import type {M3uStreamInfo} from './types';

export function splitRespectingQuotes(input: string): string[] {
	const result: string[] = [];
	let currentPart: string = '';
	let insideQuote: boolean = false;

	for (let i = 0; i < input.length; i++) {
		const char = input[i];

		// Toggle flag when encountering a quote character.
		if (char === '"') {
			insideQuote = !insideQuote;
			currentPart += char;
		}
		// If we encounter a comma and we are NOT inside a quoted substring
		else if (char === ',' && !insideQuote) {
			result.push(currentPart);
			currentPart = '';
		} else {
			currentPart += char;
		}
	}

	// Push the last token, if any.
	if (currentPart) {
		result.push(currentPart);
	}

	return result;
}

export const parseStreamInf = (str: string): M3uStreamInfo => {
	const quotes = splitRespectingQuotes(str);
	const map: Record<string, string> = {};
	for (const quote of quotes) {
		const firstColon = quote.indexOf('=');
		const key =
			firstColon === -1 ? quote : (quote.slice(0, firstColon) as string);
		const value = firstColon === -1 ? null : quote.slice(firstColon + 1);
		if (value === null) {
			throw new Error('Value is null');
		}

		const actualValue =
			value?.startsWith('"') && value?.endsWith('"')
				? value.slice(1, -1)
				: value;

		map[key] = actualValue;
	}

	return {
		type: 'm3u-stream-info',
		averageBandwidth: map['AVERAGE-BANDWIDTH']
			? parseInt(map['AVERAGE-BANDWIDTH'], 10)
			: null,
		bandwidth: map.BANDWIDTH ? parseInt(map.BANDWIDTH, 10) : null,
		codecs: map.CODECS ? map.CODECS.split(',') : null,
		resolution: map.RESOLUTION
			? {
					width: parseInt(map.RESOLUTION.split('x')[0], 10),
					height: parseInt(map.RESOLUTION.split('x')[1], 10),
				}
			: null,
		audio: map.AUDIO || null,
	};
};
