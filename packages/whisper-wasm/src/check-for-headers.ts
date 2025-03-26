const headerWarningPrinted = false;

export const checkForHeaders = () => {
	if (!headerWarningPrinted && !window.crossOriginIsolated) {
		throw new Error(
			'The document is not cross-origin isolated (window.crossOriginIsolated = false). This prevents the usage of SharedArrayBuffer, which is required by `@remotion/whisper-wasm`. Make sure the document is served with the HTTP header `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`: https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated',
		);
	}
};
