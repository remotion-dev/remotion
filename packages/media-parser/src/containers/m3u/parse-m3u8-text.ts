import {parseM3uDirective} from './parse-directive';
import type {M3uBox} from './types';

export const parseM3u8Text = (line: string, boxes: M3uBox[]) => {
	if (line === '#EXTM3U') {
		boxes.push({
			type: 'm3u-header',
		});
		return;
	}

	if (line.startsWith('#')) {
		boxes.push(parseM3uDirective(line));
		return;
	}

	if (line.trim()) {
		boxes.push({
			type: 'm3u-text-value',
			value: line,
		});
	}
};
