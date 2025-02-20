import {splitRespectingQuotes} from './parse-stream-inf';
import type {M3uMediaInfo} from './types';

export const parseM3uMediaDirective = (str: string): M3uMediaInfo => {
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
		type: 'm3u-media-info',
		autoselect: map.AUTOSELECT === 'YES',
		channels: map.CHANNELS ? parseInt(map.CHANNELS, 10) : null,
		default: map.DEFAULT === 'YES',
		groupId: map['GROUP-ID'],
		language: map.LANGUAGE || null,
		name: map.NAME || null,
		uri: map.URI,
	};
};
