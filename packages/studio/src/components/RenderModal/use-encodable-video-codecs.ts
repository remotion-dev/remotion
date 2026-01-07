import type {
	WebRendererContainer,
	WebRendererVideoCodec,
} from '@remotion/web-renderer';
import {getSupportedVideoCodecsForContainer} from '@remotion/web-renderer';
import {getEncodableVideoCodecs} from 'mediabunny';
import {useEffect, useRef, useState} from 'react';

type CacheEntry = {
	codecs: WebRendererVideoCodec[];
	status: 'fetching' | 'done';
};

type Cache = Partial<Record<WebRendererContainer, CacheEntry>>;

const webRendererToMediabunnyCodec = (
	codec: WebRendererVideoCodec,
): 'avc' | 'hevc' | 'vp8' | 'vp9' | 'av1' => {
	switch (codec) {
		case 'h264':
			return 'avc';
		case 'h265':
			return 'hevc';
		case 'vp8':
			return 'vp8';
		case 'vp9':
			return 'vp9';
		case 'av1':
			return 'av1';
		default:
			throw new Error(`Unsupported codec: ${codec satisfies never}`);
	}
};

export const useEncodableVideoCodecs = (
	container: WebRendererContainer,
): WebRendererVideoCodec[] => {
	const cacheRef = useRef<Cache>({});

	const [codecsByContainer, setCodecsByContainer] = useState<
		Partial<Record<WebRendererContainer, WebRendererVideoCodec[]>>
	>(() => {
		// Initialize with fallback for the current container
		return {
			[container]: getSupportedVideoCodecsForContainer(container),
		};
	});

	useEffect(() => {
		const cached = cacheRef.current[container];

		// Already fetched or currently fetching for this container
		if (cached) {
			return;
		}

		const supported = getSupportedVideoCodecsForContainer(container);

		// Mark as fetching to prevent duplicate requests
		cacheRef.current[container] = {
			codecs: supported,
			status: 'fetching',
		};

		const mediabunnyCodecs = supported.map(webRendererToMediabunnyCodec);

		getEncodableVideoCodecs(mediabunnyCodecs, {}).then((encodable) => {
			const filtered = supported.filter((c) =>
				encodable.includes(webRendererToMediabunnyCodec(c)),
			);

			// Update cache
			cacheRef.current[container] = {
				codecs: filtered,
				status: 'done',
			};

			// Update state - always safe because we're updating for a specific container key
			setCodecsByContainer((prev) => ({
				...prev,
				[container]: filtered,
			}));
		});
	}, [container]);

	// Return codecs for current container, or fall back to supported codecs
	return (
		codecsByContainer[container] ??
		getSupportedVideoCodecsForContainer(container)
	);
};
