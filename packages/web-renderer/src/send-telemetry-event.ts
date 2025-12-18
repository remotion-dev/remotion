import {registerUsageEvent} from '@remotion/licensing';
import {Internals} from 'remotion';

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

	if (licenseKey === null) {
		Internals.Log.warn(
			{logLevel: 'warn', tag: 'web-renderer'},
			'You need to provide a license key to use the web renderer going forward.',
		);
	}

	await registerUsageEvent({
		apiKey: licenseKey,
		event: 'webcodec-conversion',
		host,
		succeeded,
	});
};
