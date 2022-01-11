import {DevMiddlewareContext} from './types';

import path from 'path';
import {parse} from 'url';
// eslint-disable-next-line no-restricted-imports
import querystring from 'querystring';
import {getPaths} from './get-paths';

const cacheStore = new WeakMap();

const mem = (fn: Function, {cache = new Map()} = {}) => {
	const memoized = (...arguments_: unknown[]) => {
		const [key] = arguments_;
		const cacheItem = cache.get(key);

		if (cacheItem) {
			return cacheItem.data;
		}

		const result = fn.apply(this, arguments_);

		cache.set(key, {
			data: result,
		});

		return result;
	};

	cacheStore.set(memoized, cache);

	return memoized;
};

const memoizedParse = mem(parse);

export const getFilenameFromUrl = (
	context: DevMiddlewareContext,
	url: string | undefined
) => {
	const paths = getPaths(context);

	let foundFilename;
	let urlObject;

	try {
		// The `url` property of the `request` is contains only  `pathname`, `search` and `hash`
		urlObject = memoizedParse(url, false, true);
	} catch (_ignoreError) {
		return;
	}

	for (const {publicPath, outputPath} of paths) {
		let filename: string;
		let publicPathObject;

		try {
			publicPathObject = memoizedParse(
				publicPath !== 'auto' && publicPath ? publicPath : '/',
				false,
				true
			);
		} catch (_ignoreError) {
			continue;
		}

		if (urlObject.pathname?.startsWith(publicPathObject.pathname)) {
			filename = outputPath;

			// Strip the `pathname` property from the `publicPath` option from the start of requested url
			// `/complex/foo.js` => `foo.js`
			const pathname = urlObject.pathname.substr(
				publicPathObject.pathname.length
			);

			if (pathname) {
				filename = path.join(outputPath, querystring.unescape(pathname));
			}

			if (!context.outputFileSystem) {
				continue;
			}

			try {
				let fsStats = context.outputFileSystem?.statSync(filename);

				if (fsStats.isFile()) {
					foundFilename = filename;

					break;
				} else if (fsStats.isDirectory()) {
					const indexValue = 'index.html';

					filename = path.join(filename, indexValue);

					// eslint-disable-next-line max-depth
					try {
						fsStats = context.outputFileSystem.statSync(filename);
					} catch (__ignoreError) {
						continue;
					}

					// eslint-disable-next-line max-depth
					if (fsStats.isFile()) {
						foundFilename = filename;

						break;
					}
				}
			} catch (_ignoreError) {
				continue;
			}
		}
	}

	return foundFilename;
};
