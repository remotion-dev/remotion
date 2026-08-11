// Data URLs like the ones from canvas.toDataURL() can be many megabytes, which makes the delayRender() label
// unreadable and bloats log output
export function truncateSrcForLabel(src: string): string {
	if (typeof src !== 'string') {
		return String(src);
	}

	if (
		src.length > 100 &&
		(src.startsWith('data:') || src.startsWith('blob:'))
	) {
		return src.slice(0, 60) + '...[' + src.length + ' chars total]';
	}

	return src;
}
