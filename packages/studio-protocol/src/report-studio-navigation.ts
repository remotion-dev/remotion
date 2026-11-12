import * as z from 'zod/mini';
import {isAllowedStudioProtocolPageOrigin} from './install-in-studio';

const studioNavigationSchema = z.object({
	operation: z.literal('navigation'),
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
	url: z
		.string()
		.check(z.refine((url) => isAllowedStudioProtocolPageOrigin(url))),
});

export const parseStudioProtocolNavigation = (value: unknown) => {
	const parsed = z.safeParse(studioNavigationSchema, value);
	return parsed.success ? parsed.data : null;
};

export const reportStudioNavigation = (): void => {
	if (
		typeof window === 'undefined' ||
		window.parent === window ||
		!isAllowedStudioProtocolPageOrigin(window.location.origin)
	) {
		return;
	}

	window.parent.postMessage(
		{
			operation: 'navigation',
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			url: window.location.href,
		},
		'*',
	);
};
