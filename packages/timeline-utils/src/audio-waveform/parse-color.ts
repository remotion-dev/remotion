const colorCache = new Map<string, [number, number, number, number]>();

export const parseColor = (color: string): [number, number, number, number] => {
	const cached = colorCache.get(color);
	if (cached) return cached;
	const ctx = new OffscreenCanvas(1, 1).getContext('2d')!;
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
	const result: [number, number, number, number] = [r, g, b, a];
	colorCache.set(color, result);
	return result;
};
