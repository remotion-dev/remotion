import {registerUsageEvent} from '@remotion/licensing';
import {Internals} from 'remotion';

export const sendUsageEvent = async ({
	licenseKey,
	succeeded,
	apiName,
}: {
	licenseKey: string | null;
	succeeded: boolean;
	apiName: string;
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
			`Pass "licenseKey" to ${apiName}(). If you qualify for the Free License (https://remotion.dev/license), pass "free-license" instead.`,
		);
	}

	await registerUsageEvent({
		apiKey: licenseKey === 'free-license' ? null : licenseKey,
		event: 'webcodec-conversion',
		host,
		succeeded,
	});
};
