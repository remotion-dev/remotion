// Data URLs like the ones from canvas.toDataURL() can be many megabytes, which makes the delayRender() label
// unreadable and bloats log output
export function truncateSrcForLabel(src: string): string {
	if (src.startsWith('data:') && src.length > 100) {
		return src.slice(0, 60) + '...[' + src.length + ' chars total]';
	}

	return src;
}
