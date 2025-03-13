import type {
	CreateContent,
	Writer,
	WriterInterface,
} from '@remotion/media-parser';

const createContent: CreateContent = async ({filename}) => {
	const directoryHandle = await navigator.storage.getDirectory();
	const actualFilename = `__remotion_mediaparser:${filename}`;

	const remove = async () => {
		try {
			await directoryHandle.removeEntry(actualFilename, {
				recursive: true,
			});
		} catch {}
	};

	await remove();

	const fileHandle = await directoryHandle.getFileHandle(actualFilename, {
		create: true,
	});
	const writable = await fileHandle.createWritable();

	let written = 0;

	let writPromise = Promise.resolve();

	const write = async (arr: Uint8Array) => {
		await writable.write(arr);
		written += arr.byteLength;
	};

	const updateDataAt = async (position: number, data: Uint8Array) => {
		await writable.seek(position);
		await writable.write(data);
		await writable.seek(written);
	};

	const writer: Writer = {
		write: (arr: Uint8Array) => {
			writPromise = writPromise.then(() => write(arr));
			return writPromise;
		},
		finish: async () => {
			await writPromise;

			try {
				await writable.close();
			} catch {
				// Ignore, could already be closed
			}
		},
		async getBlob() {
			const newHandle = await directoryHandle.getFileHandle(actualFilename, {
				create: true,
			});
			const newFile = await newHandle.getFile();
			return newFile;
		},
		getWrittenByteCount: () => written,
		updateDataAt: (position: number, data: Uint8Array) => {
			writPromise = writPromise.then(() => updateDataAt(position, data));
			return writPromise;
		},
		remove,
	};

	return writer;
};

export const webFsWriter: WriterInterface = {
	createContent,
};

export const canUseWebFsWriter = async () => {
	if (!('storage' in navigator)) {
		return false;
	}

	if (!('getDirectory' in navigator.storage)) {
		return false;
	}

	const directoryHandle = await navigator.storage.getDirectory();
	const fileHandle = await directoryHandle.getFileHandle(
		'remotion-probe-web-fs-support',
		{
			create: true,
		},
	);

	const canUse = fileHandle.createWritable !== undefined;
	return canUse;
};
