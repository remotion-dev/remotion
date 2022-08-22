export const checkMultipleRemotionVersions = () => {
	if (typeof globalThis === 'undefined') {
		return;
	}

	if (
		(globalThis as unknown as Window).remotion_imported ||
		(typeof window !== 'undefined' && window.remotion_imported)
	) {
		throw new TypeError(
			'🚨 Multiple versions of Remotion detected. This will cause things to break in an unexpected way.\nCheck that all your Remotion packages are on the same version. You can also run `npx remotion versions` from your terminal to see which versions are mismatching.'
		);
	}

	(globalThis as unknown as Window).remotion_imported = true;
	if (typeof window !== 'undefined') {
		window.remotion_imported = true;
	}
};
