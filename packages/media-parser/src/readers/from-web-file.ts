import type {ReaderInterface} from './reader';

export const webFileReader: ReaderInterface = {
	read: ({src, range, controller}) => {
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
						abort() {
							streamReader.cancel();
							ownController.abort();
						},
					},
					contentLength: src.size,
					name: src.name,
					supportsContentRange: true,
					contentType: src.type,
					needsContentRange: true,
				});
			};

			reader.onerror = (error) => {
				reject(error);
			};
		});
	},
};
