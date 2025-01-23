import type {ReaderInterface} from './reader';

export const webFileReader: ReaderInterface = {
	read: ({src, range, signal}) => {
		if (typeof src === 'string') {
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

		const controller = new AbortController();

		if (controller) {
			controller.signal.addEventListener(
				'abort',
				() => {
					reader.abort();
				},
				{once: true},
			);
		}

		if (signal) {
			signal.addEventListener(
				'abort',
				() => {
					controller.abort();
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
						abort() {
							streamReader.cancel();
							controller.abort();
						},
					},
					contentLength: src.size,
					name: src.name,
					supportsContentRange: true,
					contentType: src.type,
				});
			};

			reader.onerror = (error) => {
				reject(error);
			};
		});
	},
	getLength: (src) => {
		if (typeof src === 'string') {
			throw new Error('`inputTypeFileReader` only supports `File` objects');
		}

		return Promise.resolve(src.size);
	},
};
