import type {EitherApiKeyOrLicenseKey} from './register-usage-event';
import {HOST} from './register-usage-event';

export type EventCount = {
	billable: number;
	failed: number;
	development: number;
};

export type GetUsageApiResponse =
	| {
			success: true;
			cloudRenders: EventCount;
			webcodecConversions: EventCount;
	  }
	| {
			success: false;
			error: string;
	  };

export type GetUsageResponse = {
	cloudRenders: EventCount;
	webcodecConversions: EventCount;
};

export const getUsage = async ({
	since,
	...apiOrLicenseKey
}: {
	since?: number | null;
} & EitherApiKeyOrLicenseKey): Promise<GetUsageResponse> => {
	const apiKey = 'apiKey' in apiOrLicenseKey ? apiOrLicenseKey.apiKey : null;
	const licenseKey =
		'licenseKey' in apiOrLicenseKey ? apiOrLicenseKey.licenseKey : null;

	const res = await fetch(`${HOST}/api/track/get-usage`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey: licenseKey ?? apiKey,
			since: since ?? null,
		}),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const json = (await res.json()) as GetUsageApiResponse;

	if (json.success) {
		return {
			cloudRenders: json.cloudRenders,
			webcodecConversions: json.webcodecConversions,
		};
	}

	throw new Error(json.error);
};
