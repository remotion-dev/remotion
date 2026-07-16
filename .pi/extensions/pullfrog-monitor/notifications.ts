export const ringTerminalBell = () => {
	try {
		process.stdout.write('\x07');
	} catch {
		// The persisted widget remains the fallback when BEL is unavailable.
	}
};
