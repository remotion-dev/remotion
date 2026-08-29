import {
	detectFileType,
	isImageFileType,
	type ImageFileType,
} from '@remotion/studio-shared';
import {useEffect, useState} from 'react';

export type ImageMetadata = {
	readonly format: string;
	readonly width: number;
	readonly height: number;
};

const cache = new Map<string, ImageMetadata>();
const pendingRequests = new Map<string, Promise<ImageMetadata | null>>();

export const getCachedImageMetadata = (src: string) => {
	return cache.get(src) ?? null;
};

const formatImageType = (fileType: ImageFileType['type']) => {
	if (fileType === 'webp') {
		return 'WebP';
	}

	return fileType.toUpperCase();
};

export const getImageMetadataFromData = (
	data: Uint8Array,
): ImageMetadata | null => {
	const fileType = detectFileType(data);

	if (!isImageFileType(fileType) || fileType.dimensions === null) {
		return null;
	}

	return {
		format: formatImageType(fileType.type),
		width: fileType.dimensions.width,
		height: fileType.dimensions.height,
	};
};

export const getImageMetadata = (
	src: string,
): Promise<ImageMetadata | null> => {
	const cached = cache.get(src);

	if (cached) {
		return Promise.resolve(cached);
	}

	const pendingRequest = pendingRequests.get(src);

	if (pendingRequest) {
		return pendingRequest;
	}

	const request = fetch(src)
		.then((response) => {
			if (!response.ok) {
				return null;
			}

			return response.arrayBuffer();
		})
		.then((data) => {
			if (data === null) {
				return null;
			}

			const metadata = getImageMetadataFromData(new Uint8Array(data));
			if (metadata) {
				cache.set(src, metadata);
			}

			return metadata;
		})
		.catch(() => null)
		.finally(() => {
			pendingRequests.delete(src);
		});

	pendingRequests.set(src, request);
	return request;
};

export const useImageMetadata = (src: string | null): ImageMetadata | null => {
	const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(
		src ? getCachedImageMetadata(src) : null,
	);

	useEffect(() => {
		const cached = src ? getCachedImageMetadata(src) : null;
		setImageMetadata(cached);

		if (!src || cached) {
			return;
		}

		let cancelled = false;

		getImageMetadata(src).then((metadata) => {
			if (!cancelled) {
				setImageMetadata(metadata);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [src]);

	return imageMetadata;
};
