export const isFlakyError = (err: Error): boolean => {
	const {message} = err;

	// storage.googleapis.com sometimes returns 500s, and Video does not have retry on its own
	if (
		message.includes('Format error') &&
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

	if (message.includes('Compositor exited') && !message.includes('SIGSEGV')) {
		return true;
	}

	if (message.includes('Timed out while setting up the headless browser')) {
		return true;
	}

	return false;
};
