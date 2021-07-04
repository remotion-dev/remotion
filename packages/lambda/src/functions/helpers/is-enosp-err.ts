export const errorIsOutOfSpaceError = (err: string) => {
	return err.includes('ENOSPC') || err.includes('No space left on device');
};
