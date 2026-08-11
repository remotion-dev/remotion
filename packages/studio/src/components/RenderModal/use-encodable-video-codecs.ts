import type {
	WebRendererContainer,
	WebRendererVideoCodec,
} from '@remotion/web-renderer';
import {
	getEncodableVideoCodecs,
	getSupportedVideoCodecsForContainer,
} from '@remotion/web-renderer';
import {useEffect, useRef, useState} from 'react';

type CacheEntry = {
	codecs: WebRendererVideoCodec[];
	status: 'fetching' | 'done';
};

type Cache = Partial<Record<WebRendererContainer, CacheEntry>>;

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

		getEncodableVideoCodecs(container)
			.then((encodable) => {
				cacheRef.current[container] = {
					codecs: encodable,
					status: 'done',
				};

				setCodecsByContainer((prev) => ({
					...prev,
					[container]: encodable,
				}));
			})
			.catch(() => {
				// On error, keep using the supported codecs fallback
				cacheRef.current[container] = {
					codecs: supported,
					status: 'done',
				};
			});
	}, [container]);

	// Return codecs for current container, or fall back to supported codecs
	return (
		codecsByContainer[container] ??
		getSupportedVideoCodecsForContainer(container)
	);
};
