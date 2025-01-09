export const isFlakyError = (err: Error): boolean => {
	const message = err.stack ?? '';

	// storage.googleapis.com sometimes returns 500s, and Video does not have retry on its own
	if (
		(message.includes('Format error') || message.includes('audio metadata')) &&
		message.includes('storage.googleapis.com')
	) {
		return true;
	}

	if (message.includes('FATAL:zygote_communication_linux.cc')) {
		return true;
	}

	if (message.includes('error while loading shared libraries: libnss3.so')) {
		return true;
	}

	if (message.includes('but the server sent no data')) {
		return true;
	}

	if (message.includes('Compositor panicked')) {
		return true;
	}

	// S3 in rare occasions
	if (message.includes('We encountered an internal error.')) {
		return true;
	}

	if (message.includes('Compositor exited') && !message.includes('SIGSEGV')) {
		return true;
	}

	if (message.includes('Timed out while setting up the headless browser')) {
		return true;
	}

	// https://github.com/remotion-dev/remotion/issues/2742
	if (message.includes('while trying to connect to the browser')) {
		return true;
	}

	// https://discord.com/channels/809501355504959528/1131234931863998665/1131998442219118622
	if (
		message.includes('RequestTimeout: Your socket connection to the server')
	) {
		return true;
	}

	if (message.includes('waiting for the page to render the React component')) {
		return true;
	}

	// In puppeteer-evaluate.ts
	if (message.includes('Timed out evaluating page function')) {
		return true;
	}

	if (message.includes('Timeout exceeded rendering the component')) {
		return true;
	}

	// CDN slowness
	if (message.includes('Loading root component')) {
		return true;
	}

	// Internet flakiness
	if (
		message.includes('getaddrinfo') ||
		message.includes('ECONNRESET') ||
		message.includes('ERR_CONNECTION_TIMED_OUT') ||
		message.includes('ERR_NETWORK_CHANGED') ||
		message.includes('A network error occurred') ||
		message.includes('socket hang up')
	) {
		return true;
	}

	if (message.includes('Target closed') || message.includes('Session closed')) {
		return true;
	}

	if (message.includes('SIGKILL')) {
		return true;
	}

	// ServiceException: We currently do not have sufficient capacity in the region you requested. Our system will be working on provisioning additional capacity. You can avoid getting this error by temporarily reducing your request rate.
	if (
		message.includes(
			'ServiceException: We currently do not have sufficient capacity in the region you requested',
		)
	) {
		return true;
	}

	return false;
};
