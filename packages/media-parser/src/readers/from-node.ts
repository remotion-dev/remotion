import {createReadStream, promises, statSync} from 'fs';
import {dirname, join, relative, sep} from 'path';
import {Readable} from 'stream';
import type {
	CreateAdjacentFileSource,
	ReadContent,
	ReadWholeAsText,
	ReaderInterface,
} from './reader';

export const nodeReadContent: ReadContent = ({src, range, controller}) => {
	if (typeof src !== 'string') {
		throw new Error('src must be a string when using `nodeReader`');
	}

	const ownController = new AbortController();

	const stream = createReadStream(src, {
		start: range === null ? 0 : typeof range === 'number' ? range : range[0],
		end:
			range === null
				? Infinity
				: typeof range === 'number'
					? Infinity
					: range[1],
		signal: ownController.signal,
	});

	controller._internals.signal.addEventListener(
		'abort',
		() => {
			ownController.abort();
		},
		{once: true},
	);

	const stats = statSync(src);

	const reader = Readable.toWeb(
		stream,
	).getReader() as ReadableStreamDefaultReader<Uint8Array>;

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
			abort: () => {
				ownController.abort();
			},
		},
		contentLength: stats.size,
		contentType: null,
		name: src.split(sep).pop() as string,
		supportsContentRange: true,
		needsContentRange: true,
	});
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

export const nodeReader: ReaderInterface = {
	read: nodeReadContent,
	readWholeAsText: nodeReadWholeAsText,
	createAdjacentFileSource: nodeCreateAdjacentFileSource,
	preload: () => {
		// doing nothing, it's just for when fetching over the network
	},
	clearPreloadCache: () => {
		// doing nothing, it's just for when fetching over the network
	},
};
