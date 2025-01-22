import type {CreateContent, Writer} from '@remotion/media-parser';

export const createContent: CreateContent = ({filename, mimeType}) => {
	const buf = new ArrayBuffer(0, {
		// TODO: Educate that the buffer is limited to 2GB
		maxByteLength: 2_000_000_000,
	});
	if (!buf.resize) {
		throw new Error('Could not create buffer writer');
	}

	const write = (newData: Uint8Array) => {
		const oldLength = buf.byteLength;
		const newLength = oldLength + newData.byteLength;
		buf.resize(newLength);
		const newArray = new Uint8Array(buf);
		newArray.set(newData, oldLength);
	};

	const updateDataAt = (position: number, newData: Uint8Array) => {
		const newArray = new Uint8Array(buf);
		newArray.set(newData, position);
	};

	let writPromise = Promise.resolve();

	let removed = false;

	const writer: Writer = {
		write: (arr: Uint8Array) => {
			writPromise = writPromise.then(() => write(arr));
			return writPromise;
		},
		finish: async () => {
			await writPromise;

			if (removed) {
				return Promise.reject(
					new Error('Already called .remove() on the result'),
				);
			}

			return Promise.resolve();
		},
		getBlob() {
			const arr = new Uint8Array(buf);
			return Promise.resolve(
				// TODO: Unhardcode MIME type and file name
				new File([arr.slice()], filename, {type: mimeType}),
			);
		},
		remove() {
			removed = true;
			return Promise.resolve();
		},
		getWrittenByteCount: () => buf.byteLength,
		updateDataAt: (position: number, newData: Uint8Array) => {
			writPromise = writPromise.then(() => updateDataAt(position, newData));
			return writPromise;
		},
	};
	return Promise.resolve(writer);
};
