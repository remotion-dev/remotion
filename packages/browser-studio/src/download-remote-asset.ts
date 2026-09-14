import {
	detectFileType,
	getRemoteAssetElement,
	getRemoteAssetFilename,
	isImageFileType,
	maxRemoteAssetSize,
	remoteAssetAcceptHeader,
	remoteAssetDownloadTimeout,
	type DownloadRemoteAssetRequest,
	type DownloadRemoteAssetResponse,
} from '@remotion/studio-shared';
import type {VirtualProject, VirtualProjectPublicFile} from './types';

const getPublicFileSize = (contents: VirtualProjectPublicFile) => {
	if (typeof contents === 'string') {
		return new TextEncoder().encode(contents).byteLength;
	}

	return contents instanceof Uint8Array
		? contents.byteLength
		: contents.sizeInBytes;
};

export const downloadRemoteAssetInBrowserStudio = async ({
	getProject,
	request,
	writeStaticFile,
}: {
	getProject: () => VirtualProject;
	request: DownloadRemoteAssetRequest;
	writeStaticFile: (request: {
		contents: string | ArrayBuffer;
		filePath: string;
	}) => Promise<void>;
}): Promise<DownloadRemoteAssetResponse> => {
	const url = new URL(request.url);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		throw new Error('Only HTTP(S) URLs can be imported');
	}

	if (url.username !== '' || url.password !== '') {
		throw new Error('Remote asset URLs cannot include credentials');
	}

	const abortController = new AbortController();
	const timeout = setTimeout(() => {
		abortController.abort();
	}, remoteAssetDownloadTimeout);

	let contents: Uint8Array;
	try {
		let response: Response;
		try {
			response = await fetch(url, {
				headers: {accept: remoteAssetAcceptHeader},
				signal: abortController.signal,
			});
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				throw new Error('Timed out downloading remote asset');
			}

			throw new Error(
				`Could not fetch remote asset. The URL may not allow cross-origin requests (CORS): ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}

		if (!response.ok) {
			throw new Error(`Could not download remote asset: ${response.status}`);
		}

		const contentLength = response.headers.get('content-length');
		if (contentLength !== null && Number(contentLength) > maxRemoteAssetSize) {
			abortController.abort();
			throw new Error('Remote asset exceeds the 50MB size limit');
		}

		if (!response.body) {
			const buffer = await response.arrayBuffer();
			if (buffer.byteLength > maxRemoteAssetSize) {
				throw new Error('Remote asset exceeds the 50MB size limit');
			}

			contents = new Uint8Array(buffer);
		} else {
			const reader = response.body.getReader();
			const chunks: Uint8Array[] = [];
			let size = 0;

			while (true) {
				const {done, value} = await reader.read();
				if (done) {
					break;
				}

				if (!value) {
					continue;
				}

				size += value.byteLength;
				if (size > maxRemoteAssetSize) {
					abortController.abort();
					await reader.cancel();
					throw new Error('Remote asset exceeds the 50MB size limit');
				}

				chunks.push(value);
			}

			contents = new Uint8Array(size);
			let offset = 0;
			for (const chunk of chunks) {
				contents.set(chunk, offset);
				offset += chunk.byteLength;
			}
		}
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error('Timed out downloading remote asset');
		}

		throw error;
	} finally {
		clearTimeout(timeout);
	}

	const fileType = detectFileType(contents);
	if (!isImageFileType(fileType)) {
		throw new Error('Remote asset is not a supported image');
	}

	const assetPath = getRemoteAssetFilename({fileType, url});
	const existing = Object.entries(getProject().publicFiles ?? {}).find(
		([path]) => path.replace(/^\/+/, '') === assetPath,
	)?.[1];
	if (
		existing !== undefined &&
		getPublicFileSize(existing) !== contents.byteLength
	) {
		throw new Error(
			`File with name ${assetPath} already exists and is different`,
		);
	}

	if (existing === undefined) {
		await writeStaticFile({
			contents: contents.slice().buffer,
			filePath: assetPath,
		});
	}

	return {
		assetPath,
		created: existing === undefined,
		element: getRemoteAssetElement({assetPath, fileType}),
		sizeInBytes: contents.byteLength,
	};
};
