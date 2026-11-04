export const errorIsOutOfSpaceError = (err: string) => {
	return (
		err.includes('ENOSPC') ||
		err.toLowerCase().includes('no space left on device')
	);
};

export const isErrInsufficientResourcesErr = (err: string) => {
	return err.includes('net::ERR_INSUFFICIENT_RESOURCES');
};

export const isBrowserCrashedError = (err: string) => {
	return err.includes('Target closed.') || err.includes('Session closed');
};
