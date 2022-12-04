import type {StaticFile} from './static-file';

let warnedServer = false;
let warnedPlayer = false;

const warnServerOnce = () => {
	if (warnedServer) {
		return;
	}

	warnedServer = true;
	console.warn(
		'Called getStaticFiles() on the server. The API is only available in the browser. An empty array was returned.'
	);
};

const warnPlayerOnce = () => {
	if (warnedPlayer) {
		return;
	}

	warnedPlayer = true;
	console.warn(
		'Called getStaticFiles() while using the Remotion Player. The API is only available while using the Remotion Preview. An empty array was returned.'
	);
};

export const getStaticFiles = (): StaticFile[] => {
	if (typeof document === 'undefined') {
		warnServerOnce();
		return [];
	}

	if (window.remotion_isPlayer) {
		warnPlayerOnce();
		return [];
	}

	return window.remotion_staticFiles;
};
