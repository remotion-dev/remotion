type CodexAnnotation = {
	readonly request: (
		target: Element,
		options: {
			metadata: Record<string, string | number>;
		},
	) => {accepted: boolean};
};

export const getCodexAnnotation = (): CodexAnnotation | null => {
	if (typeof document === 'undefined') {
		return null;
	}

	// The Codex browser injects this bridge. Check it when used, since the
	// browser can install or remove it after the page has loaded.
	const annotation = (
		document as Document & {
			oai: {annotation: CodexAnnotation | null} | null;
		}
	).oai?.annotation;

	return typeof annotation?.request === 'function' ? annotation : null;
};
