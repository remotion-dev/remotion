// From https://github.com/jamestalmage/supports-hyperlinks/blob/master/index.js

// MIT License
// Copyright (c) James Talmage <james@talmage.io> (github.com/jamestalmage)
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import {RenderInternals} from '@remotion/renderer';

function parseVersion(versionString: string) {
	if (/^\d{3,4}$/.test(versionString)) {
		// Env var doesn't always use dots. example: 4601 => 46.1.0
		const m = /(\d{1,2})(\d{2})/.exec(versionString) || [];
		return {
			major: 0,
			minor: parseInt(m[1] as string, 10),
			patch: parseInt(m[2] as string, 10),
		};
	}

	const versions = (versionString || '').split('.').map((n) => parseInt(n, 10));
	return {
		major: versions[0],
		minor: versions[1],
		patch: versions[2],
	};
}

export function supportsHyperlink(): false | string {
	const {
		CI,
		NETLIFY,
		TEAMCITY_VERSION,
		TERM_PROGRAM,
		TERM_PROGRAM_VERSION,
		VTE_VERSION,
	} = process.env;

	// Netlify does not run a TTY, it does not need `supportsColor` check
	if (NETLIFY) {
		return 'Click';
	}

	// If they specify no colors, they probably don't want hyperlinks.
	if (!RenderInternals.isColorSupported()) {
		return false;
	}

	if (process.platform === 'win32') {
		return false;
	}

	if (CI) {
		return false;
	}

	if (TEAMCITY_VERSION) {
		return false;
	}

	if (TERM_PROGRAM) {
		const version = parseVersion(TERM_PROGRAM_VERSION || '');

		switch (TERM_PROGRAM) {
			case 'iTerm.app':
				if (version.major === 3) {
					return (version.minor as number) >= 1 ? 'Cmd+Click' : false;
				}

				return (version.major as number) > 3 ? 'Cmd+Click' : false;
			case 'WezTerm':
				return (version.major as number) >= 20200620 ? 'Click' : false;
			case 'vscode':
				return (version.major as number) > 1 ||
					(version.major === 1 && (version.minor as number) >= 72)
					? process.platform === 'darwin'
						? 'Option+Click'
						: 'Ctrl+Click'
					: false;
			// No default
		}
	}

	if (VTE_VERSION) {
		// 0.50.0 was supposed to support hyperlinks, but throws a segfault
		if (VTE_VERSION === '0.50.0') {
			return false;
		}

		const version = parseVersion(VTE_VERSION);
		return (version.major as number) > 0 || (version.minor as number) >= 50
			? 'Click'
			: false;
	}

	return false;
}
