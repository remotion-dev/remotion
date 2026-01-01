import {registerUsageEvent} from '@remotion/licensing';

export const sendUsageEvent = async ({
	licenseKey,
	succeeded,
}: {
	licenseKey: string | null;
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
		licenseKey,
		event: 'webcodec-conversion',
		host,
		succeeded,
	});
};
