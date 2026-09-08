import type {StreamTargetChunk} from 'mediabunny';

const filePrefix = '__remotion_video_matting:';
let sessionId: string | null = null;

const getSessionPrefix = () => {
	if (sessionId === null) {
		sessionId = crypto.randomUUID();
	}

	return `${filePrefix}${sessionId}:`;
};

export const canUseWebFsWriter = async (): Promise<boolean> => {
	if (typeof navigator === 'undefined' || !('storage' in navigator)) {
		return false;
	}

	if (!('getDirectory' in navigator.storage)) {
		return false;
	}

	const probeName = `${filePrefix}probe:${crypto.randomUUID()}`;
	try {
		const directoryHandle = await navigator.storage.getDirectory();
		const fileHandle = await directoryHandle.getFileHandle(probeName, {
			create: true,
		});
		const writable = await fileHandle.createWritable();
		await writable.close();
		await directoryHandle.removeEntry(probeName);
		return true;
	} catch {
		try {
			const directoryHandle = await navigator.storage.getDirectory();
			await directoryHandle.removeEntry(probeName);
		} catch {
			// The probe may not have created a file.
		}

		return false;
	}
};

export type WebFsVideoLayerTarget = {
	stream: WritableStream<StreamTargetChunk>;
	getBlob: () => Promise<Blob>;
	remove: () => Promise<void>;
};

export const createWebFsVideoLayerTarget =
	async (): Promise<WebFsVideoLayerTarget> => {
		const directoryHandle = await navigator.storage.getDirectory();
		const filename = `${getSessionPrefix()}${crypto.randomUUID()}`;
		const fileHandle = await directoryHandle.getFileHandle(filename, {
			create: true,
		});
		let writable: FileSystemWritableFileStream;
		try {
			writable = await fileHandle.createWritable();
		} catch (error) {
			try {
				await directoryHandle.removeEntry(filename);
			} catch {
				// Preserve the error that prevented the writable from being created.
			}

			throw error;
		}

		let closed = false;
		let removed = false;
		let removalPromise: Promise<void> | null = null;

		const close = async () => {
			if (closed) {
				return;
			}

			closed = true;
			await writable.close();
		};

		const abort = async (reason?: unknown) => {
			if (closed) {
				return;
			}

			closed = true;
			await writable.abort(reason);
		};

		const stream = new WritableStream<StreamTargetChunk>({
			async write(chunk) {
				await writable.seek(chunk.position);
				await writable.write(chunk);
			},
			close,
			abort,
		});

		const getBlob = async () => {
			const currentFileHandle = await directoryHandle.getFileHandle(filename);
			return currentFileHandle.getFile();
		};

		const remove = () => {
			if (removed) {
				return Promise.resolve();
			}

			if (removalPromise === null) {
				removalPromise = (async () => {
					try {
						await abort(new Error('Video layer output was discarded'));
					} catch {
						// Removing the file must still be attempted if aborting it fails.
					}

					try {
						await directoryHandle.removeEntry(filename);
					} catch (error) {
						if (
							typeof error !== 'object' ||
							error === null ||
							!('name' in error) ||
							error.name !== 'NotFoundError'
						) {
							throw error;
						}
					}

					removed = true;
				})().catch((error: unknown) => {
					removalPromise = null;
					throw error;
				});
			}

			return removalPromise;
		};

		return {stream, getBlob, remove};
	};
