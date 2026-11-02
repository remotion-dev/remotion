const cache = new Map<string, OffscreenCanvas>();
const MAX_CACHE_BYTES = 64 * 1024 * 1024;
let cacheBytes = 0;

const removeCachedFrame = (src: string, canvas: OffscreenCanvas) => {
	cache.delete(src);
	cacheBytes -= canvas.width * canvas.height * 4;
	canvas.width = 0;
	canvas.height = 0;
};

export const cacheVideoFrame = (
	src: string,
	sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
): void => {
	const {width, height} = sourceCanvas;
	if (width === 0 || height === 0) {
		return;
	}

	let cached = cache.get(src);
	if (!cached || cached.width !== width || cached.height !== height) {
		if (cached) {
			removeCachedFrame(src, cached);
		}

		const bytes = width * height * 4;
		// The reveal cache is optional; a single oversized frame must not
		// exceed its budget or evict every useful smaller frame.
		if (bytes > MAX_CACHE_BYTES) {
			return;
		}

		for (const [key, canvas] of cache) {
			if (cacheBytes + bytes <= MAX_CACHE_BYTES) {
				break;
			}

			removeCachedFrame(key, canvas);
		}

		cached = new OffscreenCanvas(width, height);
		cache.set(src, cached);
		cacheBytes += bytes;
	}

	cache.delete(src);
	cache.set(src, cached);

	const ctx = cached.getContext('2d');
	if (!ctx) {
		return;
	}

	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(sourceCanvas, 0, 0);
};

export const getCachedVideoFrame = (src: string): OffscreenCanvas | null => {
	const cached = cache.get(src);
	if (!cached) {
		return null;
	}

	cache.delete(src);
	cache.set(src, cached);
	return cached;
};
