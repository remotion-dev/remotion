const STORAGE_PREFIX = 'remotion-canvas-capture:';
const MESSAGE_PREFIX = 'remotion-canvas-capture';

type StoredCaptureMetadata = {
	readonly filename: string;
	readonly mimeType: string;
	readonly chunks: number;
};

const captureId = new URL(window.location.href).searchParams.get(
	'canvas-capture',
);
let isDelivering = false;

const getMetadataKey = (id: string) => `${STORAGE_PREFIX}${id}:metadata`;
const getChunkKey = (id: string, index: number) =>
	`${STORAGE_PREFIX}${id}:chunk:${index}`;

const removeCaptureParameter = () => {
	const url = new URL(window.location.href);
	url.searchParams.delete('canvas-capture');
	window.history.replaceState(
		null,
		'',
		`${url.pathname}${url.search}${url.hash}`,
	);
};

const deliverCapture = async (id: string) => {
	const metadataKey = getMetadataKey(id);
	const storedMetadata = await chrome.storage.local.get(metadataKey);
	const metadata = storedMetadata[metadataKey] as
		| StoredCaptureMetadata
		| undefined;

	if (
		!metadata ||
		typeof metadata.filename !== 'string' ||
		typeof metadata.mimeType !== 'string' ||
		!Number.isSafeInteger(metadata.chunks) ||
		metadata.chunks < 0
	) {
		throw new Error('The canvas capture could not be found.');
	}

	window.postMessage(
		{
			type: `${MESSAGE_PREFIX}-start`,
			captureId: id,
			filename: metadata.filename,
			mimeType: metadata.mimeType,
			chunks: metadata.chunks,
		},
		window.location.origin,
	);

	for (let index = 0; index < metadata.chunks; index++) {
		const key = getChunkKey(id, index);
		const storedChunk = await chrome.storage.local.get(key);
		const chunk = storedChunk[key];
		if (typeof chunk !== 'string') {
			throw new Error(`Canvas capture chunk ${index + 1} is missing.`);
		}

		window.postMessage(
			{
				type: `${MESSAGE_PREFIX}-chunk`,
				captureId: id,
				index,
				data: chunk,
			},
			window.location.origin,
		);
		await chrome.storage.local.remove(key);
	}

	window.postMessage(
		{type: `${MESSAGE_PREFIX}-complete`, captureId: id},
		window.location.origin,
	);
	await chrome.storage.local.remove(metadataKey);
	removeCaptureParameter();
};

if (captureId) {
	window.addEventListener('message', (event) => {
		if (
			isDelivering ||
			event.source !== window ||
			event.origin !== window.location.origin ||
			typeof event.data !== 'object' ||
			event.data === null ||
			event.data.type !== `${MESSAGE_PREFIX}-ready` ||
			event.data.captureId !== captureId
		) {
			return;
		}

		isDelivering = true;
		deliverCapture(captureId).catch((error) => {
			window.postMessage(
				{
					type: `${MESSAGE_PREFIX}-error`,
					captureId,
					message: error instanceof Error ? error.message : String(error),
				},
				window.location.origin,
			);
		});
	});
}
