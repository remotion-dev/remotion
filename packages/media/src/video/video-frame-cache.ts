const cache = new Map<string, OffscreenCanvas>();

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
		cached = new OffscreenCanvas(width, height);
		cache.set(src, cached);
	}

	const ctx = cached.getContext('2d');
	if (!ctx) {
		return;
	}

	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(sourceCanvas, 0, 0);
};

export const getCachedVideoFrame = (src: string): OffscreenCanvas | null => {
	return cache.get(src) ?? null;
};
