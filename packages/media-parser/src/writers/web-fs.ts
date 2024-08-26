import type {WriterInterface} from './writer';

const createContent = async () => {
	const directoryHandle = await navigator.storage.getDirectory();
	const fileHandle = await directoryHandle.getFileHandle('out.web', {
		create: true,
	});
	const f = await fileHandle.getFile();
	const writable = await fileHandle.createWritable();

	let written = 0;

	return {
		write: async (arr: Uint8Array) => {
			await writable.write(arr);
			written += arr.byteLength;
		},
		save: async () => {
			const picker = await window.showSaveFilePicker({
				suggestedName: `${Math.random().toString().replace('.', '')}.webm`,
			});
			const pickerWriteable = await picker.createWritable();
			const stream = f.stream();
			await stream.pipeTo(pickerWriteable);

			await writable.close();
		},
		getWrittenByteCount: () => written,
		updateVIntAt: () => {
			// TODO: Do something here...
		},
	};
};

export const webFsWriter: WriterInterface = {
	createContent,
};
