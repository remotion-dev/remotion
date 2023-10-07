import {extname} from 'node:path';
import {mimeDb} from './mime-db';

const extensions: Record<string, string[]> = {};
const types: Record<string, string> = {};

// Populate the extensions/types maps
populateMaps(extensions, {});

export const getExt = (contentType: string): string | null => {
	return mimeDb[contentType.toLowerCase()]?.extensions?.[0] ?? null;
};

export function mimeLookup(path: string) {
	if (!path || typeof path !== 'string') {
		return false;
	}

	// get the extension ("ext" or ".ext" or full path)
	const ext = extname('.' + path)
		.toLowerCase()
		.substr(1);

	if (!ext) {
		return false;
	}

	return types[ext] || false;
}

/**
 * Populate the extensions and types maps.
 * @private
 */

function populateMaps(
	exts: Record<string, string[]>,
	_types: Record<string, string>,
) {
	// source preference (least -> most)
	const preference = ['nginx', 'apache', undefined, 'iana'];

	Object.keys(mimeDb).forEach((type) => {
		const mime = mimeDb[type];
		const _exts = mime.extensions;

		if (!_exts?.length) {
			return;
		}

		// mime -> extensions
		exts[type] = _exts;

		// extension -> mime
		for (let i = 0; i < _exts.length; i++) {
			const _ext = _exts[i];

			if (_types[_ext]) {
				const from = preference.indexOf(mimeDb[_types[_ext]].source);
				const to = preference.indexOf(mime.source);

				if (
					_types[_ext] !== 'application/octet-stream' &&
					(from > to ||
						(from === to && _types[_ext].substr(0, 12) === 'application/'))
				) {
					// skip the remapping
					continue;
				}
			}

			// set the extension -> mime
			types[_ext] = type;
		}
	});
}

export function mimeContentType(str: string): false | string {
	if (!str || typeof str !== 'string') {
		return false;
	}

	let mime = str.indexOf('/') === -1 ? mimeLookup(str) : str;

	if (!mime) {
		return false;
	}

	if (mime.indexOf('charset') === -1) {
		const _charset = charset(mime);
		if (_charset) mime += '; charset=' + _charset.toLowerCase();
	}

	return mime;
}

const EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
const TEXT_TYPE_REGEXP = /^text\//i;

function charset(type: string) {
	if (!type || typeof type !== 'string') {
		return false;
	}

	const match = EXTRACT_TYPE_REGEXP.exec(type);
	const mime = match && mimeDb[match[1].toLowerCase()];

	if (mime?.charset) {
		return mime.charset;
	}

	// default text/* to utf-8
	if (match && TEXT_TYPE_REGEXP.test(match[1])) {
		return 'UTF-8';
	}

	return false;
}
