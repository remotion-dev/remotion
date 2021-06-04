export const checkMultipleRemotionVersions = () => {
	if (typeof window === 'undefined') {
		return;
	}

	if (window.remotion_imported) {
		console.error(
			'🚨 Multiple versions of Remotion detected. Multiple versions will cause conflicting React contexts and things may break in an unexpected way. Please check your dependency tree and make sure only one version of Remotion is on the page.'
		);
	}

	window.remotion_imported = true;
};
