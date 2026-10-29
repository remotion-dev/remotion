import {canvasCaptureChunkSize} from '@remotion/studio-shared/canvas-capture-handoff';
import {browser} from 'wxt/browser';

export const captureStoragePrefix = 'remotion-canvas-capture:';
export const captureLifetime = 10 * 60 * 1000;

export type StoredCaptureMetadata = {
	readonly filename: string;
	readonly mimeType: string;
	readonly chunks: number;
	readonly size: number;
	readonly destination: CaptureHandoffDestination;
	readonly expiresAt: number;
	readonly tabId: number | null;
};

export const getMetadataKey = (captureId: string) =>
	`${captureStoragePrefix}${captureId}:metadata`;

export const getChunkKey = (captureId: string, index: number) =>
	`${captureStoragePrefix}${captureId}:chunk:${index}`;

export const getStoredCapture = async (
	captureId: string,
): Promise<StoredCaptureMetadata | null> => {
	const key = getMetadataKey(captureId);
	const stored = await browser.storage.local.get(key);
	const metadata = stored[key] as Partial<StoredCaptureMetadata> | undefined;
	if (
		!metadata ||
		typeof metadata.filename !== 'string' ||
		typeof metadata.mimeType !== 'string' ||
		typeof metadata.size !== 'number' ||
		!Number.isSafeInteger(metadata.size) ||
		metadata.size < 0 ||
		metadata.chunks !== Math.ceil(metadata.size / canvasCaptureChunkSize) ||
		(metadata.destination !== 'new' && metadata.destination !== 'convert') ||
		typeof metadata.expiresAt !== 'number' ||
		!Number.isFinite(metadata.expiresAt) ||
		(metadata.tabId !== null && !Number.isSafeInteger(metadata.tabId))
	) {
		return null;
	}

	return metadata as StoredCaptureMetadata;
};

export const removeStoredCapture = async (
	captureId: string,
	chunks: number,
) => {
	await browser.storage.local.remove([
		getMetadataKey(captureId),
		...Array.from({length: chunks}, (_, index) =>
			getChunkKey(captureId, index),
		),
	]);
};

export const removeExpiredCaptures = async () => {
	const keys = await browser.storage.local.getKeys();
	const metadataKeys = keys.filter(
		(key) => key.startsWith(captureStoragePrefix) && key.endsWith(':metadata'),
	);
	const metadata = await browser.storage.local.get(metadataKeys);
	const expiredPrefixes = metadataKeys
		.filter((key) => {
			const value = metadata[key] as Partial<StoredCaptureMetadata> | undefined;
			return (
				typeof value?.expiresAt !== 'number' || value.expiresAt <= Date.now()
			);
		})
		.map((key) => key.slice(0, -'metadata'.length));
	await browser.storage.local.remove(
		keys.filter((key) =>
			expiredPrefixes.some((prefix) => key.startsWith(prefix)),
		),
	);
};

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

export type CaptureHandoffDestination = 'convert' | 'new';

export const openCaptureInRemotion = async (
	file: File,
	destination: CaptureHandoffDestination,
) => {
	const captureId = crypto.randomUUID();
	const chunkCount = Math.ceil(file.size / canvasCaptureChunkSize);
	const storedKeys: string[] = [];

	try {
		const metadata: StoredCaptureMetadata = {
			filename: file.name,
			mimeType: file.type,
			chunks: chunkCount,
			size: file.size,
			destination,
			expiresAt: Date.now() + captureLifetime,
			tabId: null,
		};
		const metadataKey = getMetadataKey(captureId);
		await browser.storage.local.set({[metadataKey]: metadata});
		storedKeys.push(metadataKey);

		for (let index = 0; index < chunkCount; index++) {
			const key = getChunkKey(captureId, index);
			const bytes = new Uint8Array(
				await file
					.slice(
						index * canvasCaptureChunkSize,
						(index + 1) * canvasCaptureChunkSize,
					)
					.arrayBuffer(),
			);
			await browser.storage.local.set({[key]: toBase64(bytes)});
			storedKeys.push(key);
		}

		await browser.runtime.sendMessage({
			type: 'remotion-canvas-capture-open',
			captureId,
		});
	} catch (error) {
		await browser.storage.local.remove(storedKeys).catch(() => undefined);
		throw error;
	}
};
