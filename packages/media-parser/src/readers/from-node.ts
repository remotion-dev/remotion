import {createReadStream, existsSync, promises, statSync} from 'fs';
import {dirname, join, relative, sep} from 'path';
import type {
	CreateAdjacentFileSource,
	MediaParserReaderInterface,
	ReadContent,
	ReadWholeAsText,
} from './reader';

export const nodeReadContent: ReadContent = async ({
	src,
	range,
	controller,
}) => {
	if (typeof src !== 'string') {
		throw new Error('src must be a string when using `nodeReader`');
	}

	await Promise.resolve();

	const ownController = new AbortController();

	try {
		if (!existsSync(src)) {
			throw new Error(`File does not exist: ${src}`);
		}

		const stream = createReadStream(src, {
			start: range === null ? 0 : typeof range === 'number' ? range : range[0],
			end:
				range === null
					? Infinity
					: typeof range === 'number'
						? Infinity
						: range[1],
		});

		controller._internals.signal.addEventListener(
			'abort',
			() => {
				ownController.abort();
			},
			{once: true},
		);

		const stats = statSync(src);

		let readerCancelled = false;
		const reader = new ReadableStream({
			start(c) {
				if (readerCancelled) {
					return;
				}

				stream.on('data', (chunk) => {
					c.enqueue(chunk);
				});
				stream.on('end', () => {
					if (readerCancelled) {
						return;
					}

					c.close();
				});
				stream.on('error', (err) => {
					c.error(err);
				});
			},
			cancel() {
				readerCancelled = true;
				stream.destroy();
			},
		}).getReader() as ReadableStreamDefaultReader<Uint8Array>;

		if (controller) {
			controller._internals.signal.addEventListener(
				'abort',
				() => {
					reader.cancel().catch(() => {});
				},
				{once: true},
			);
		}

		return Promise.resolve({
			reader: {
				reader,
				abort: async () => {
					try {
						stream.destroy();
						ownController.abort();
						await reader.cancel();
					} catch {}
				},
			},
			contentLength: stats.size,
			contentType: null,
			name: src.split(sep).pop() as string,
			supportsContentRange: true,
			needsContentRange: true,
		});
	} catch (err) {
		return Promise.reject(err);
	}
};

export const nodeReadWholeAsText: ReadWholeAsText = (src) => {
	if (typeof src !== 'string') {
		throw new Error('src must be a string when using `nodeReader`');
	}

	return promises.readFile(src, 'utf8');
};

export const nodeCreateAdjacentFileSource: CreateAdjacentFileSource = (
	relativePath,
	src,
) => {
	if (typeof src !== 'string') {
		throw new Error('src must be a string when using `nodeReader`');
	}

	const result = join(dirname(src), relativePath);
	const rel = relative(dirname(src), result);
	if (rel.startsWith('..')) {
		throw new Error(
			'Path is outside of the parent directory - not allowing reading of arbitrary files',
		);
	}

	return result;
};

export const nodeReader: MediaParserReaderInterface = {
	read: nodeReadContent,
	readWholeAsText: nodeReadWholeAsText,
	createAdjacentFileSource: nodeCreateAdjacentFileSource,
	preload: () => {
		// doing nothing, it's just for when fetching over the network
	},
};
