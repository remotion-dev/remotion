import type {StreamTargetChunk} from 'mediabunny';

let sessionId: string | null = null;

const getPrefix = () => {
	if (!sessionId) {
		sessionId = crypto.randomUUID();
	}

	return `__remotion_render:${sessionId}:`;
};

let cleanupRan = false;

export const cleanupStaleOpfsFiles = async (): Promise<void> => {
	if (cleanupRan) {
		return;
	}

	cleanupRan = true;

	const root = await navigator.storage.getDirectory();
	for await (const [name] of root.entries()) {
		if (
			name.startsWith('__remotion_render:') &&
			!name.startsWith(getPrefix())
		) {
			try {
				await root.removeEntry(name);
			} catch {
				// File may be in use by another tab, skip it
			}
		}
	}
};

export const createWebFsTarget = async () => {
	const directoryHandle = await navigator.storage.getDirectory();
	const filename = `${getPrefix()}${crypto.randomUUID()}`;

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
