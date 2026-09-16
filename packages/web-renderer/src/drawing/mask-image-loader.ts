export type MaskImageLoaderState = {
	cache: Map<string, Promise<ImageBitmap>>;
	nativeCache: Map<string, Promise<HTMLImageElement>>;
	images: Set<ImageBitmap>;
	signal: AbortSignal | null;
	timeoutInMilliseconds: number;
	[Symbol.dispose]: () => void;
};

export const makeMaskImageLoaderState = ({
	signal,
	timeoutInMilliseconds,
}: {
	signal: AbortSignal | null;
	timeoutInMilliseconds: number;
}): MaskImageLoaderState => {
	const images = new Set<ImageBitmap>();
	const nativeCache = new Map<string, Promise<HTMLImageElement>>();

	return {
		cache: new Map(),
		nativeCache,
		images,
		signal,
		timeoutInMilliseconds,
		[Symbol.dispose]: () => {
			for (const image of images) {
				image.close();
			}

			images.clear();
			nativeCache.clear();
		},
	};
};

const validateMaskImageUrl = (src: string) => {
	const url = new URL(src, document.baseURI);
	if (url.protocol === 'data:' || url.protocol === 'blob:') {
		return url.href;
	}

	if (
		(url.protocol === 'http:' || url.protocol === 'https:') &&
		url.origin === window.location.origin
	) {
		return url.href;
	}

	throw new Error(
		`@remotion/web-renderer only supports same-origin, data:, and blob: mask-image URLs. Received: ${url.href}`,
	);
};

const loadMaskImage = async <T extends ImageBitmap | HTMLImageElement>({
	src,
	state,
	load,
	cleanup,
}: {
	src: string;
	state: MaskImageLoaderState;
	load: (src: string, signal: AbortSignal) => Promise<T>;
	cleanup: () => void;
}) => {
	const resolvedSrc = validateMaskImageUrl(src);
	if (state.signal?.aborted) {
		throw new Error(`Loading mask-image URL was cancelled: ${resolvedSrc}`);
	}

	const controller = new AbortController();
	let timedOut = false;
	const onAbort = () => controller.abort();
	state.signal?.addEventListener('abort', onAbort, {once: true});
	const timeout = window.setTimeout(() => {
		timedOut = true;
		controller.abort();
	}, state.timeoutInMilliseconds);

	const operation = load(resolvedSrc, controller.signal);
	operation.then(
		(image) => {
			if (controller.signal.aborted && image instanceof ImageBitmap) {
				image.close();
			}
		},
		() => undefined,
	);
	const aborted = new Promise<never>((_, reject) => {
		controller.signal.addEventListener(
			'abort',
			() => reject(new Error('Mask image loading was aborted')),
			{once: true},
		);
	});

	try {
		const image = await Promise.race([operation, aborted]);
		if (image instanceof ImageBitmap) {
			state.images.add(image);
		}

		return image;
	} catch (error) {
		if (timedOut) {
			throw new Error(
				`Timed out loading mask-image URL after ${state.timeoutInMilliseconds}ms: ${resolvedSrc}`,
			);
		}

		if (state.signal?.aborted) {
			throw new Error(`Loading mask-image URL was cancelled: ${resolvedSrc}`);
		}

		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(`Could not load mask-image URL ${resolvedSrc}: ${detail}`);
	} finally {
		window.clearTimeout(timeout);
		state.signal?.removeEventListener('abort', onAbort);
		if (controller.signal.aborted) {
			cleanup();
		}
	}
};

export const getMaskImage = ({
	src,
	state,
}: {
	src: string;
	state: MaskImageLoaderState;
}) => {
	const cached = state.cache.get(src);
	if (cached) {
		return cached;
	}

	const promise = loadMaskImage({
		src,
		state,
		cleanup: () => undefined,
		load: async (resolvedSrc, signal) => {
			const response = await fetch(resolvedSrc, {
				credentials: 'same-origin',
				signal,
			});
			if (!response.ok) {
				throw new Error(`HTTP ${response.status} ${response.statusText}`);
			}

			const blob = await response.blob();
			const contentType = blob.type.toLowerCase().split(';')[0];
			if (
				!contentType.startsWith('image/') ||
				contentType === 'image/svg+xml'
			) {
				throw new Error(
					`Expected a raster image, but received Content-Type "${blob.type || 'unknown'}"`,
				);
			}

			return createImageBitmap(blob);
		},
	});
	state.cache.set(src, promise);
	promise.catch(() => state.cache.delete(src));
	return promise;
};

export const getNativeMaskImage = ({
	src,
	state,
}: {
	src: string;
	state: MaskImageLoaderState;
}) => {
	const cached = state.nativeCache.get(src);
	if (cached && !state.signal?.aborted) {
		return cached;
	}

	const image = new Image();
	const promise = loadMaskImage({
		src,
		state,
		cleanup: () => image.removeAttribute('src'),
		load: async (resolvedSrc) => {
			// CSS masks use the browser image cache, not fetched ImageBitmaps.
			image.crossOrigin = 'anonymous';
			image.src = resolvedSrc;
			await image.decode();
			return image;
		},
	});
	state.nativeCache.set(src, promise);
	promise.catch(() => state.nativeCache.delete(src));
	return promise;
};
