const {
	setEditorHandler,
	startReportingRuntimeErrors,
	dismissRuntimeErrors,
} = require('react-error-overlay');
const launchEditorEndpoint = require('react-dev-utils/launchEditorEndpoint');

type ErrorLocation = {
	fileName: string;
	lineNumber: number;
	colNumber?: number;
};

setEditorHandler((errorLocation: ErrorLocation) => {
	// Keep this sync with errorOverlayMiddleware.js
	fetch(
		launchEditorEndpoint +
			'?fileName=' +
			window.encodeURIComponent(errorLocation.fileName) +
			'&lineNumber=' +
			window.encodeURIComponent(errorLocation.lineNumber || 1) +
			'&colNumber=' +
			window.encodeURIComponent(errorLocation.colNumber || 1)
	);
});

startReportingRuntimeErrors({
	onError() {
		if (module.hot) {
			module.hot.addStatusHandler((status) => {
				if (status === 'apply') {
					// window.location.reload();
					dismissRuntimeErrors();
				}
			});
		}
	},
});
