import {parseM3u8Text} from './parse-m3u8-text';
import type {M3uBox} from './types';

export const fetchM3u8Stream = async (url: string): Promise<M3uBox[]> => {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch ${url} (HTTP code: ${res.status})`);
	}

	const text = await res.text();
	const lines = text.split('\n');
	const boxes: M3uBox[] = [];
	for (const line of lines) {
		parseM3u8Text(line.trim(), boxes);
	}

	return boxes;
};
