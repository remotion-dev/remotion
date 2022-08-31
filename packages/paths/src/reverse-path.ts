/**
 * https://github.com/Pomax/svg-path-reverse
 *
 * This code is in the public domain, except in jurisdictions that do
 * not recognise the public domain, where this code is MIT licensed.
 */

import {normalizePath} from './normalize-path';

/**
 * Normalise an SVG path to absolute coordinates
 * and full commands, rather than relative coordinates
 * and/or shortcut commands.
 */

/**
 * Reverse an SVG path.
 * As long as the input path is normalised, this is actually really
 * simple to do. As all pathing commands are symmetrical, meaning
 * that they render the same when you reverse the coordinate order,
 * the grand trick here is to reverse the path (making sure to keep
 * coordinates ordered pairwise) and shift the operators left by
 * one or two coordinate pairs depending on the operator:
 *
 *   - Z is removed (after noting it existed),
 *   - L moves to 2 spots earlier (skipping one coordinate),
 *   - Q moves to 2 spots earlier (skipping one coordinate),
 *   - C moves to 4 spots earlier (skipping two coordinates)
 *       and its arguments get reversed,
 *   - the path start becomes M.
 *   - the path end becomes Z iff it was there to begin with.
 */
function reverseNormalizedPath(normalized: string) {
	const terms = normalized.trim().split(' ');
	let term;
	const tlen = terms.length;
	const tlen1 = tlen - 1;
	let t;
	const reversed = [];
	let x;
	let y;
	let pair;
	let pairs;
	let shift;
	const matcher = /[QAZLCM]/;
	const closed = terms.slice(-1)[0].toUpperCase() === 'Z';

	for (t = 0; t < tlen; t++) {
		term = terms[t];

		// Is this an operator? If it is, run through its
		// argument list, which we know is fixed length.
		if (matcher.test(term)) {
			// Arc processing relies on not-just-coordinates
			if (term === 'A') {
				reversed.push(terms[t + 5] === '0' ? '1' : '0');
				reversed.push(terms[t + 4]);
				reversed.push(terms[t + 3]);
				reversed.push(terms[t + 2]);
				reversed.push(terms[t + 1]);
				reversed.push(term);
				reversed.push(terms[t + 7]);
				reversed.push(terms[t + 6]);
				t += 7;
				continue;
			}

			// how many coordinate pairs do we need to read,
			// and by how many pairs should this operator be
			// shifted left?
			else if (term === 'C') {
				pairs = 3;
				shift = 2;
			} else if (term === 'Q') {
				pairs = 2;
				shift = 1;
			} else if (term === 'L') {
				pairs = 1;
				shift = 1;
			} else if (term === 'M') {
				pairs = 1;
				shift = 0;
			} else {
				continue;
			}

			// do the argument reading and operator shifting
			if (pairs === shift) {
				reversed.push(term);
			}

			for (pair = 0; pair < pairs; pair++) {
				if (pair === shift) {
					reversed.push(term);
				}

				x = terms[++t];
				y = terms[++t];
				reversed.push(y);
				reversed.push(x);
			}
		}
		// the code has been set up so that every time we
		// iterate because of the for() operation, the term
		// we see is a pathing operator, not a number. As
		// such, if we get to this "else" the path is malformed.
		else {
			const pre = terms.slice(Math.max(t - 3, 0), 3).join(' ');
			const post = terms.slice(t + 1, Math.min(t + 4, tlen1)).join(' ');
			const range = pre + ' [' + term + '] ' + post;
			throw new Error(
				'Error while trying to reverse normalized SVG path, at position ' +
					t +
					' (' +
					range +
					').\n' +
					"Either the path is not normalised, or it's malformed."
			);
		}
	}

	reversed.push('M');

	// generating the reversed path string involves
	// running through our transformed terms in reverse.
	let revstring = '';
	const rlen1 = reversed.length - 1;
	let r;
	for (r = rlen1; r > 0; r--) {
		revstring += reversed[r] + ' ';
	}

	if (closed) revstring += 'Z';
	revstring = revstring.replace(/M M/g, 'Z M');

	return revstring;
}

/**
 * Reverses a path so the end and start are switched.
 * @param {string} path A valid SVG path
 * @link https://remotion.dev/docs/paths/reverse-path
 */
export const reversePath = (path: string) => {
	const normalizedPath = normalizePath(path);
	const paths = normalizedPath.replace(/M/g, '|M').split('|');
	paths.splice(0, 1);

	return paths
		.map((spath) => {
			return reverseNormalizedPath(spath.trim());
		})
		.join(' ')
		.replace(/ +/g, ' ')
		.trim();
};
