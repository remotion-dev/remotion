import type {
	CreateAdjacentFileSource,
	MediaParserReaderInterface,
	ReadContent,
	ReadWholeAsText,
} from './reader';

export const webFileReadContent: ReadContent = ({src, range, controller}) => {
	if (typeof src === 'string' || src instanceof URL) {
		throw new Error('`inputTypeFileReader` only supports `File` objects');
	}

	const part =
		range === null
			? src
			: typeof range === 'number'
				? src.slice(range)
				: src.slice(range[0], range[1] + 1);

	const stream = part.stream();
	const streamReader = stream.getReader();

	if (controller) {
		controller._internals.signal.addEventListener(
			'abort',
			() => {
				streamReader.cancel();
			},
			{once: true},
		);
	}

	return Promise.resolve({
		reader: {
			reader: streamReader,
			async abort() {
				try {
					await streamReader.cancel();
				} catch {}

				return Promise.resolve();
			},
		},
		contentLength: src.size,
		name: src instanceof File ? src.name : src.toString(),
		supportsContentRange: true,
		contentType: src.type,
		needsContentRange: true,
	});
};

export const webFileReadWholeAsText: ReadWholeAsText = () => {
	throw new Error('`webFileReader` cannot read auxiliary files.');
};

export const webFileCreateAdjacentFileSource: CreateAdjacentFileSource = () => {
	throw new Error('`webFileReader` cannot create adjacent file sources.');
};

export const webFileReader: MediaParserReaderInterface = {
	read: webFileReadContent,
	readWholeAsText: webFileReadWholeAsText,
	createAdjacentFileSource: webFileCreateAdjacentFileSource,
	preload: () => {
		// doing nothing, it's just for when fetching over the network
	},
};
