import type {WriterInterface} from './writer';

const createContent = async () => {
	const directoryHandle = await navigator.storage.getDirectory();
	const fileHandle = await directoryHandle.getFileHandle('out.web', {
		create: true,
	});
	const f = await fileHandle.getFile();
	const writable = await fileHandle.createWritable();

	return {
		write: async (arr: Uint8Array) => {
			await writable.write(arr);
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
	};
};

export const webFsWriter: WriterInterface = {
	createContent,
};
