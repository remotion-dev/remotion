export const isDevelopmentRenderHost = (hostname: string): boolean => {
	const host = hostname.trim().toLowerCase();
	if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
		return true;
	}

	if (host.startsWith('[') && host.endsWith(']')) {
		return host.slice(1, -1) === '::1';
	}

	return host.endsWith('.localhost');
};

export const getClientRenderBillingHint = (hostname: string): string => {
	if (isDevelopmentRenderHost(hostname)) {
		return 'This is a development render (localhost) and will not be charged.';
	}

	return 'This is considered a production render and may count toward usage.';
};
