import type {ReaderInterface} from './reader';

export const webFileReader: ReaderInterface = {
	read: (file, range, signal) => {
		if (typeof file === 'string') {
			throw new Error('`inputTypeFileReader` only supports `File` objects');
		}

		const part =
			range === null
				? file
				: typeof range === 'number'
					? file.slice(range)
					: file.slice(range[0], range[1]);

		const reader = new FileReader();
		reader.readAsArrayBuffer(file);

		if (signal) {
			signal.addEventListener(
				'abort',
				() => {
					reader.abort();
				},
				{once: true},
			);
		}

		return new Promise((resolve, reject) => {
			reader.onload = () => {
				resolve({
					reader: part.stream().getReader(),
					contentLength: file.size,
					name: file.name,
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
