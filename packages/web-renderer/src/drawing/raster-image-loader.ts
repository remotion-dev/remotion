export type RasterImageLoaderState = {
	cache: Map<string, Promise<ImageBitmap>>;
	images: Set<ImageBitmap>;
	signal: AbortSignal | null;
	timeoutInMilliseconds: number;
	[Symbol.dispose]: () => void;
};

export const makeRasterImageLoaderState = ({
	signal,
	timeoutInMilliseconds,
}: {
	signal: AbortSignal | null;
	timeoutInMilliseconds: number;
}): RasterImageLoaderState => {
	const images = new Set<ImageBitmap>();

	return {
		cache: new Map(),
		images,
		signal,
		timeoutInMilliseconds,
		[Symbol.dispose]: () => {
			for (const image of images) {
				image.close();
			}

			images.clear();
		},
	};
};

const validateRasterImageUrl = (
	src: string,
	sourceProperty: 'mask-image' | 'background-image',
) => {
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
		`@remotion/web-renderer only supports same-origin, data:, and blob: ${sourceProperty} URLs. Received: ${url.href}`,
	);
};

const loadRasterImage = async ({
	src,
	state,
	sourceProperty,
}: {
	src: string;
	sourceProperty: 'mask-image' | 'background-image';
	state: RasterImageLoaderState;
}) => {
	const resolvedSrc = validateRasterImageUrl(src, sourceProperty);
	if (state.signal?.aborted) {
		throw new Error(
			`Loading ${sourceProperty} URL was cancelled: ${resolvedSrc}`,
		);
	}

	const controller = new AbortController();
	let timedOut = false;
	const onAbort = () => controller.abort();
	state.signal?.addEventListener('abort', onAbort, {once: true});
	const timeout = window.setTimeout(() => {
		timedOut = true;
		controller.abort();
	}, state.timeoutInMilliseconds);

	const operation = (async () => {
		const response = await fetch(resolvedSrc, {
			credentials: 'same-origin',
			signal: controller.signal,
		});
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}

		const blob = await response.blob();
		const contentType = blob.type.toLowerCase().split(';')[0];
		if (!contentType.startsWith('image/') || contentType === 'image/svg+xml') {
			throw new Error(
				`Expected a raster image, but received Content-Type "${blob.type || 'unknown'}"`,
			);
		}

		return createImageBitmap(blob);
	})();
	operation.then(
		(image) => {
			if (controller.signal.aborted) {
				image.close();
			}
		},
		() => undefined,
	);
	const aborted = new Promise<never>((_, reject) => {
		controller.signal.addEventListener(
			'abort',
			() => reject(new Error(`${sourceProperty} loading was aborted`)),
			{once: true},
		);
	});

	try {
		const image = await Promise.race([operation, aborted]);
		state.images.add(image);
		return image;
	} catch (error) {
		if (timedOut) {
			throw new Error(
				`Timed out loading ${sourceProperty} URL after ${state.timeoutInMilliseconds}ms: ${resolvedSrc}`,
			);
		}

		if (state.signal?.aborted) {
			throw new Error(
				`Loading ${sourceProperty} URL was cancelled: ${resolvedSrc}`,
			);
		}

		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(
			`Could not load ${sourceProperty} URL ${resolvedSrc}: ${detail}`,
		);
	} finally {
		window.clearTimeout(timeout);
		state.signal?.removeEventListener('abort', onAbort);
	}
};

export const getRasterImage = ({
	src,
	state,
	sourceProperty,
}: {
	src: string;
	sourceProperty: 'mask-image' | 'background-image';
	state: RasterImageLoaderState;
}) => {
	const cached = state.cache.get(src);
	if (cached) {
		return cached;
	}

	const promise = loadRasterImage({src, state, sourceProperty});
	state.cache.set(src, promise);
	promise.catch(() => state.cache.delete(src));
	return promise;
};
