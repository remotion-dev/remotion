import type {StreamTargetChunk} from 'mediabunny';

export const makeWebFsTarget = async (filename: string) => {
	const directoryHandle = await navigator.storage.getDirectory();
	const actualFilename = `__remotion_convert:${filename}`;

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

	const writableStream = new WritableStream({
		async write(chunk: StreamTargetChunk) {
			await writable.seek(chunk.position);
			await writable.write(chunk);
			written += chunk.data.byteLength;
		},
	});

	const getBlob = async () => {
		const newHandle = await directoryHandle.getFileHandle(actualFilename, {
			create: true,
		});
		const newFile = await newHandle.getFile();
		return newFile;
	};

	return {
		stream: writableStream,
		getBlob,
		getWrittenByteCount: () => written,
		close: () => writable.close(),
	};
};
