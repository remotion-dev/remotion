export const isTargetClosedErr = (error: Error | undefined) => {
	return (
		error?.message?.includes('Target closed') ||
		error?.message?.includes('Session closed')
	);
};
