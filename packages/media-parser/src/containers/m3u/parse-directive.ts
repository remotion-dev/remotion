import {parseStreamInf} from './parse-stream-inf';
import type {M3uBox} from './types';

export const parseM3uDirective = (str: string): M3uBox => {
	const firstColon = str.indexOf(':');
	const directive = firstColon === -1 ? str : str.slice(0, firstColon);
	const value = firstColon === -1 ? null : str.slice(firstColon + 1);

	if (directive === '#EXT-X-VERSION') {
		if (!value) {
			throw new Error('EXT-X-VERSION directive must have a value');
		}

		return {
			type: 'm3u-version',
			version: value,
		};
	}

	if (directive === '#EXT-X-INDEPENDENT-SEGMENTS') {
		return {
			type: 'm3u-independent-segments',
		};
	}

	if (directive === '#EXT-X-STREAM-INF') {
		if (!value) {
			throw new Error('EXT-X-STREAM-INF directive must have a value');
		}

		const res = parseStreamInf(value);
		return res;
	}

	throw new Error(`Unknown directive ${directive}. Value: ${value}`);
};
