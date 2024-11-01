export const isTargetClosedErr = (error: Error | undefined) => {
	return (
		error?.message?.includes('Target closed') ||
		error?.message?.includes('Session closed')
	);
};

export const isFlakyNetworkError = (error: Error | undefined) => {
	return (
		error?.message?.includes('ERR_CONNECTION_REFUSED') ||
		error?.message?.includes('ERR_CONNECTION_RESET') ||
		error?.message?.includes('ERR_CONNECTION_TIMED_OUT') ||
		error?.message?.includes('ERR_INTERNET_DISCONNECTED') ||
		error?.message?.includes('ERR_NAME_RESOLUTION_FAILED') ||
		error?.message?.includes('ERR_ADDRESS_UNREACHABLE') ||
		error?.message?.includes('ERR_NETWORK_CHANGED')
	);
};
