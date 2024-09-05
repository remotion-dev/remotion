import type {Writer, WriterInterface} from './writer';

const createContent = async () => {
	const directoryHandle = await navigator.storage.getDirectory();
	const filename = `media-parser-${Math.random().toString().replace('0.', '')}.webm`;

	const fileHandle = await directoryHandle.getFileHandle(filename, {
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
		save: async () => {
			try {
				await writable.close();
			} catch (err) {
				// Ignore, could already be closed
			}

			const picker = await window.showSaveFilePicker({
				suggestedName: `${Math.random().toString().replace('.', '')}.webm`,
			});

			const newHandle = await directoryHandle.getFileHandle(filename, {
				create: true,
			});
			const newFile = await newHandle.getFile();
			const pickerWriteable = await picker.createWritable();
			const stream = newFile.stream();
			await stream.pipeTo(pickerWriteable);

			await directoryHandle.removeEntry(filename, {
				recursive: true,
			});
		},
		getWrittenByteCount: () => written,
		updateDataAt: (position: number, data: Uint8Array) => {
			writPromise = writPromise.then(() => updateDataAt(position, data));
			return writPromise;
		},
		waitForFinish: async () => {
			await writPromise;
		},
	};

	return writer;
};

export const webFsWriter: WriterInterface = {
	createContent,
};

export const canUseWebFsWriter = async () => {
	if (window.showSaveFilePicker === undefined) {
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
