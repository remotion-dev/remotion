export const checkMultipleRemotionVersions = () => {
	if (typeof window === 'undefined') {
		return;
	}

	if (window.remotion_imported) {
		console.error('🚨 Multiple versions of Remotion detected.');
		console.error(
			'Please check your dependency tree and make sure only one version of Remotion is on the page.'
		);
	}

	window.remotion_imported = true;
};
