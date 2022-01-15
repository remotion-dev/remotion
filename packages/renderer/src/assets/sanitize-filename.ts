// Inlined from https://github.com/parshap/node-sanitize-filename/blob/master/index.js

import {truncateUtf8Bytes} from './truncate-utf8-bytes';

/**
 * Replaces characters in strings that are illegal/unsafe for filenames.
 * Unsafe characters are either removed or replaced by a substitute set
 * in the optional `options` object.
 *
 * Illegal Characters on Various Operating Systems
 * / ? < > \ : * | "
 * https://kb.acronis.com/content/39790
 *
 * Unicode Control codes
 * C0 0x00-0x1f & C1 (0x80-0x9f)
 * http://en.wikipedia.org/wiki/C0_and_C1_control_codes
 *
 * Reserved filenames on Unix-based systems (".", "..")
 * Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
 * "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
 * "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
 * "LPT9") case-insesitively and with or without filename extensions.
 *
 * Capped at 255 characters in length.
 * http://unix.stackexchange.com/questions/32795/what-is-the-maximum-allowed-filename-and-folder-size-with-ecryptfs
 *
 * @param  {String} input   Original filename
 * @param  {Object} options {replacement: String | Function }
 * @return {String}         Sanitized filename
 */

const illegalRe = /[/?<>\\:*|"]/g;
// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const windowsTrailingRe = /[. ]+$/;

function sanitize(input: string, replacement: string) {
	if (typeof input !== 'string') {
		throw new Error('Input must be string');
	}

	const sanitized = input
		.replace(illegalRe, replacement)
		.replace(controlRe, replacement)
		.replace(reservedRe, replacement)
		.replace(windowsReservedRe, replacement)
		.replace(windowsTrailingRe, replacement);
	return truncateUtf8Bytes(sanitized, 255);
}

export const sanitizeFilename = (input: string) => {
	const replacement = '';
	const output = sanitize(input, replacement);
	if (replacement === '') {
		return output;
	}

	return sanitize(output, '');
};
