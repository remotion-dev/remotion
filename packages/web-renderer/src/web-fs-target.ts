import type {StreamTargetChunk} from 'mediabunny';

export const createWebFsTarget = async () => {
	const directoryHandle = await navigator.storage.getDirectory();
	const filename = `__remotion_render:${crypto.randomUUID()}`;

	const fileHandle = await directoryHandle.getFileHandle(filename, {
		create: true,
	});
	const writable = await fileHandle.createWritable();

	const stream = new WritableStream({
		async write(chunk: StreamTargetChunk) {
			await writable.seek(chunk.position);
			await writable.write(chunk);
		},
	});

	const getBlob = async () => {
		const handle = await directoryHandle.getFileHandle(filename);
		return handle.getFile();
	};

	const close = () => writable.close();

	return {stream, getBlob, close};
};
