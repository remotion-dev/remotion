type RasterImageResource = {image: ImageBitmap; blob: Blob};

export type RasterImageLoaderState = {
	cache: Map<string, Promise<RasterImageResource>>;
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
	const cache = new Map<string, Promise<RasterImageResource>>();
	const owner = new AbortController();
	const abort = () => owner.abort();
	if (signal?.aborted) abort();
	else signal?.addEventListener('abort', abort, {once: true});

	return {
		cache,
		images,
		signal: owner.signal,
		timeoutInMilliseconds,
		[Symbol.dispose]: () => {
			owner.abort();
			signal?.removeEventListener('abort', abort);
			for (const image of images) {
				image.close();
			}

			images.clear();
			cache.clear();
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

		return {image: await createImageBitmap(blob), blob};
	})();
	operation.then(
		(resource) => {
			if (controller.signal.aborted) {
				resource.image.close();
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
		const resource = await Promise.race([operation, aborted]);
		state.images.add(resource.image);
		return resource;
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

const getRasterImageResource = ({
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

type RasterImageRequest = Parameters<typeof getRasterImageResource>[0];

export const getRasterImage = async (request: RasterImageRequest) => {
	return (await getRasterImageResource(request)).image;
};

// SVG image documents cannot fetch the original URL themselves. Embed the
// bytes already fetched and validated by the incumbent raster resource loader.
export const getRasterImageDataUrl = async (request: RasterImageRequest) => {
	const {blob} = await getRasterImageResource(request);
	const reader = new FileReader();
	const {signal} = request.state;
	if (signal?.aborted) throw new Error('Raster image embedding was cancelled');
	const abort = () => reader.abort();
	signal?.addEventListener('abort', abort, {once: true});
	try {
		return await new Promise<string>((resolve, reject) => {
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.onabort = () =>
				reject(new Error('Raster image embedding was cancelled'));
			reader.readAsDataURL(blob);
		});
	} finally {
		signal?.removeEventListener('abort', abort);
	}
};
