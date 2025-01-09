import {registerUsageEvent} from '@remotion/licensing';

export const sendUsageEvent = async ({
	apiKey,
	succeeded,
}: {
	apiKey: string | null;
	succeeded: boolean;
}) => {
	const host =
		typeof window === 'undefined'
			? null
			: typeof window.location === 'undefined'
				? null
				: (window.location.origin ?? null);
	if (host === null) {
		return;
	}

	await registerUsageEvent({
		apiKey,
		event: 'webcodec-conversion',
		host,
		succeeded,
	});
};
