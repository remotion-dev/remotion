import type {
	WebRendererAudioCodec,
	WebRendererContainer,
} from '@remotion/web-renderer';
import {
	getEncodableAudioCodecs,
	getSupportedAudioCodecsForContainer,
} from '@remotion/web-renderer';
import {useEffect, useRef, useState} from 'react';

type CacheEntry = {
	codecs: WebRendererAudioCodec[];
	status: 'fetching' | 'done';
};

type Cache = Partial<Record<WebRendererContainer, CacheEntry>>;

export const useEncodableAudioCodecs = (
	container: WebRendererContainer,
): WebRendererAudioCodec[] => {
	const cacheRef = useRef<Cache>({});

	const [codecsByContainer, setCodecsByContainer] = useState<
		Partial<Record<WebRendererContainer, WebRendererAudioCodec[]>>
	>(() => {
		// Initialize with fallback for the current container
		return {
			[container]: getSupportedAudioCodecsForContainer(container),
		};
	});

	useEffect(() => {
		const cached = cacheRef.current[container];

		// Already fetched or currently fetching for this container
		if (cached) {
			return;
		}

		const supported = getSupportedAudioCodecsForContainer(container);

		// Mark as fetching to prevent duplicate requests
		cacheRef.current[container] = {
			codecs: supported,
			status: 'fetching',
		};

		getEncodableAudioCodecs(container)
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
		getSupportedAudioCodecsForContainer(container)
	);
};
