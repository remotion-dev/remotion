const STORAGE_PREFIX = 'remotion-canvas-capture:';
const CHUNK_SIZE = 1024 * 1024;

type StoredCaptureMetadata = {
	readonly filename: string;
	readonly mimeType: string;
	readonly chunks: number;
};

const getMetadataKey = (captureId: string) =>
	`${STORAGE_PREFIX}${captureId}:metadata`;

const getChunkKey = (captureId: string, index: number) =>
	`${STORAGE_PREFIX}${captureId}:chunk:${index}`;

const toBase64 = (bytes: Uint8Array) => {
	let binary = '';
	const batchSize = 32_768;

	for (let offset = 0; offset < bytes.length; offset += batchSize) {
		binary += String.fromCharCode(
			...bytes.subarray(offset, offset + batchSize),
		);
	}

	return btoa(binary);
};

export const openCaptureInConvert = async (file: File) => {
	const captureId = crypto.randomUUID();
	const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
	const storedKeys: string[] = [];

	try {
		for (let index = 0; index < chunkCount; index++) {
			const key = getChunkKey(captureId, index);
			const bytes = new Uint8Array(
				await file
					.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
					.arrayBuffer(),
			);
			await chrome.storage.local.set({[key]: toBase64(bytes)});
			storedKeys.push(key);
		}

		const metadata: StoredCaptureMetadata = {
			filename: file.name,
			mimeType: file.type,
			chunks: chunkCount,
		};
		const metadataKey = getMetadataKey(captureId);
		await chrome.storage.local.set({[metadataKey]: metadata});
		storedKeys.push(metadataKey);

		await chrome.runtime.sendMessage({
			type: 'remotion-canvas-capture-open-convert',
			captureId,
		});
	} catch (error) {
		await chrome.storage.local.remove(storedKeys).catch(() => undefined);
		throw error;
	}
};
