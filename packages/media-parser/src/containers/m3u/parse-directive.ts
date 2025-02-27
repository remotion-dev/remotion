import {parseM3uMediaDirective} from './parse-m3u-media-directive';
import {parseStreamInf} from './parse-stream-inf';
import type {M3uBox} from './types';

export const parseM3uDirective = (str: string): M3uBox => {
	const firstColon = str.indexOf(':');
	const directive = (firstColon === -1 ? str : str.slice(0, firstColon)).trim();
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

	if (directive === '#EXT-X-MEDIA') {
		if (!value) {
			throw new Error('EXT-X-MEDIA directive must have a value');
		}

		const parsed = parseM3uMediaDirective(value);

		return parsed;
	}

	if (directive === '#EXT-X-TARGETDURATION') {
		if (!value) {
			throw new Error('EXT-X-TARGETDURATION directive must have a value');
		}

		return {
			type: 'm3u-target-duration',
			duration: parseFloat(value),
		};
	}

	if (directive === '#EXTINF') {
		if (!value) {
			throw new Error('EXTINF has no value');
		}

		return {
			type: 'm3u-extinf',
			value: parseFloat(value),
		};
	}

	if (directive === '#EXT-X-ENDLIST') {
		return {
			type: 'm3u-endlist',
		};
	}

	if (directive === '#EXT-X-PLAYLIST-TYPE') {
		if (!value) {
			throw new Error('#EXT-X-PLAYLIST-TYPE. directive must have a value');
		}

		return {
			type: 'm3u-playlist-type',
			playlistType: value,
		};
	}

	if (directive === '#EXT-X-MEDIA-SEQUENCE') {
		if (!value) {
			throw new Error('#EXT-X-MEDIA-SEQUENCE directive must have a value');
		}

		return {
			type: 'm3u-media-sequence',
			value: Number(value),
		};
	}

	if (directive === '#EXT-X-DISCONTINUITY-SEQUENCE') {
		if (!value) {
			throw new Error(
				'#EXT-X-DISCONTINUITY-SEQUENCE directive must have a value',
			);
		}

		return {
			type: 'm3u-discontinuity-sequence',
			value: Number(value),
		};
	}

	if (directive === '#EXT-X-STREAM-INF') {
		if (!value) {
			throw new Error('EXT-X-STREAM-INF directive must have a value');
		}

		const res = parseStreamInf(value);
		return res;
	}

	if (directive === '#EXT-X-MAP') {
		if (!value) {
			throw new Error('#EXT-X-MAP directive must have a value');
		}

		return {
			type: 'm3u-map',
			value: Number(value),
		};
	}

	throw new Error(`Unknown directive ${directive}. Value: ${value}`);
};
