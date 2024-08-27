import type {Writer, WriterInterface} from './writer';

const createContent = async () => {
	const directoryHandle = await navigator.storage.getDirectory();
	const filename = `media-parser-${Math.random().toString().replace('0.', '')}.webm`;

	const fileHandle = await directoryHandle.getFileHandle(filename, {
		create: true,
	});
	const writable = await fileHandle.createWritable();

	let written = 0;

	const writer: Writer = {
		write: async (arr: Uint8Array) => {
			await writable.write(arr);
			written += arr.byteLength;
		},
		save: async () => {
			await writable.close();
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
		updateVIntAt: async (position: number, vint: Uint8Array) => {
			await writable.seek(position);
			await writable.write(vint);
			await writable.seek(written);
		},
	};

	return writer;
};

export const webFsWriter: WriterInterface = {
	createContent,
};
