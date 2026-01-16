import {registerUsageEvent} from '@remotion/licensing';
import {Internals} from 'remotion';

export const sendUsageEvent = async ({
	licenseKey,
	succeeded,
	apiName,
	isStill,
	isProduction,
}: {
	licenseKey: string | null;
	succeeded: boolean;
	apiName: string;
	isStill: boolean | null;
	isProduction: boolean | null;
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
		licenseKey: licenseKey === 'free-license' ? null : licenseKey,
		event: 'webcodec-conversion',
		host,
		succeeded,
		isStill,
		isProduction,
	});
};
