export const getBrowserStudioEndpoint = ({
	hostname,
	origin,
}: {
	readonly hostname: string;
	readonly origin: string;
}) => {
	if (!hostname.endsWith('.vercel.app')) {
		return null;
	}

	return new URL('/experimental_new', origin).href;
};
