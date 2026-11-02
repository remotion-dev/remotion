import {getEncodedOutputPath} from './output-path';
import {
	getPreviewServerConnectionState,
	subscribeToPreviewServerEvents,
} from './preview-server-events';

const getOutputPathname = (path: string) => {
	const serverPath =
		window.remotion_fileSystemPlatform === 'win32'
			? path.replace(/\\/g, '/')
			: path;
	return new URL(
		getEncodedOutputPath(serverPath).replace(/\/{2,}/g, '/'),
		'http://localhost',
	).pathname;
};

export const watchRenderOutput = (path: string, onChange: () => void) => {
	const pathname = getOutputPathname(path);
	const connection = getPreviewServerConnectionState();
	let clientId = connection.type === 'connected' ? connection.clientId : null;

	return subscribeToPreviewServerEvents((event) => {
		if (event.type === 'init' && event.clientId !== clientId) {
			clientId = event.clientId;
			onChange();
		}

		if (
			event.type === 'render-output-written' &&
			getOutputPathname(event.path) === pathname
		) {
			onChange();
		}
	});
};
