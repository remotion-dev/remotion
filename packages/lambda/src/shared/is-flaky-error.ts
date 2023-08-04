export const isFlakyError = (err: Error): boolean => {
	const {message} = err;

	return (
		message.includes('FATAL:zygote_communication_linux.cc') ||
		message.includes('error while loading shared libraries: libnss3.so') ||
		message.includes('but the server sent no data') ||
		message.includes('Compositor panicked') ||
		(message.includes('Compositor exited') && !message.includes('SIGSEGV')) ||
		message.includes('Timed out while setting up the headless browser')
	);
};
