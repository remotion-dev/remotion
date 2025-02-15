import type {M3uStream} from './get-streams';
import {parseM3u8Text} from './parse-m3u8-text';
import type {M3uBox} from './types';

export const fetchM3u8Stream = async (stream: M3uStream) => {
	const res = await fetch(stream.url);
	const text = await res.text();
	const lines = text.split('\n');
	const boxes: M3uBox[] = [];
	for (const line of lines) {
		parseM3u8Text(line, boxes);
	}

	console.log({boxes});
};
