/*
	Source code adapted from https://github.com/browserify/path-browserify and refactored in Typescript. This file is MIT-licensed.
*/

function normalizeStringPosix(path: string, allowAboveRoot: boolean) {
	let res = '';
	let lastSegmentLength = 0;
	let lastSlash = -1;
	let dots = 0;
	let code;
	for (let i = 0; i <= path.length; ++i) {
		if (i < path.length) code = path.charCodeAt(i);
		else if (code === 47 /* / */) break;
		else code = 47 /* / */;
		if (code === 47 /* / */) {
			if (lastSlash === i - 1 || dots === 1) {
				// NOOP
			} else if (lastSlash !== i - 1 && dots === 2) {
				if (
					res.length < 2 ||
					lastSegmentLength !== 2 ||
					res.charCodeAt(res.length - 1) !== 46 /* . */ ||
					res.charCodeAt(res.length - 2) !== 46 /* . */
				) {
					if (res.length > 2) {
						const lastSlashIndex = res.lastIndexOf('/');
						// eslint-disable-next-line max-depth
						if (lastSlashIndex !== res.length - 1) {
							// eslint-disable-next-line max-depth
							if (lastSlashIndex === -1) {
								res = '';
								lastSegmentLength = 0;
							} else {
								res = res.slice(0, lastSlashIndex);
								lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
							}

							lastSlash = i;
							dots = 0;
							continue;
						}
					} else if (res.length === 2 || res.length === 1) {
						res = '';
						lastSegmentLength = 0;
						lastSlash = i;
						dots = 0;
						continue;
					}
				}

				if (allowAboveRoot) {
					if (res.length > 0) res += '/..';
					else res = '..';
					lastSegmentLength = 2;
				}
			} else {
				if (res.length > 0) res += '/' + path.slice(lastSlash + 1, i);
				else res = path.slice(lastSlash + 1, i);
				lastSegmentLength = i - lastSlash - 1;
			}

			lastSlash = i;
			dots = 0;
		} else if (code === 46 /* . */ && dots !== -1) {
			++dots;
		} else {
			dots = -1;
		}
	}

	return res;
}
