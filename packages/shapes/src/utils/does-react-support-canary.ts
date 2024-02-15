export const doesReactSupportTransformOriginProperty = (version: string) => {
	if (version.includes('canary') || version.includes('experimental')) {
		const last8Chars = parseInt(version.slice(-8), 10);
		return last8Chars > 20230209;
	}

	const [major, minor] = version.split('.').map(Number);
	return major > 18 || (major === 18 && minor >= 3);
};
