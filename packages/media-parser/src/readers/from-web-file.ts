import type {
	CreateAdjacentFileSource,
	ReadContent,
	ReaderInterface,
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
				: src.slice(range[0], range[1]);

	const reader = new FileReader();
	reader.readAsArrayBuffer(src);

	const ownController = new AbortController();

	if (ownController) {
		ownController.signal.addEventListener(
			'abort',
			() => {
				reader.abort();
			},
			{once: true},
		);
	}

	if (controller) {
		controller._internals.signal.addEventListener(
			'abort',
			() => {
				ownController.abort();
			},
			{once: true},
		);
	}

	return new Promise((resolve, reject) => {
		reader.onload = () => {
			const stream = part.stream();
			const streamReader = stream.getReader();
			resolve({
				reader: {
					reader: streamReader,
					async abort() {
						try {
							await streamReader.cancel();
							ownController.abort();
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

		reader.onerror = () => {
			reject(reader.error);
		};
	});
};

export const webFileReadWholeAsText: ReadWholeAsText = () => {
	throw new Error('`webFileReader` cannot read auxiliary files.');
};

export const webFileCreateAdjacentFileSource: CreateAdjacentFileSource = () => {
	throw new Error('`webFileReader` cannot create adjacent file sources.');
};

export const webFileReader: ReaderInterface = {
	read: webFileReadContent,
	readWholeAsText: webFileReadWholeAsText,
	createAdjacentFileSource: webFileCreateAdjacentFileSource,
	preload: () => {
		// doing nothing, it's just for when fetching over the network
	},
};
