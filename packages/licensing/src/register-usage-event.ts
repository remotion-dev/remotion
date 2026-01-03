export const HOST = 'https://www.remotion.pro';
import type {NoReactInternals} from 'remotion/no-react';
import {isNetworkError} from './is-network-error';

type ApiResponse =
	| {
			success: true;
			billable: boolean;
			classification: UsageEventClassification;
	  }
	| {
			success: false;
			error: string;
	  };

export type RegisterUsageEventResponse = {
	billable: boolean;
	classification: UsageEventClassification;
};

type UsageEventType = 'webcodec-conversion' | 'cloud-render';

export type UsageEventClassification = 'billable' | 'development' | 'failed';

type EitherApiKeyOrLicenseKey =
	true extends typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES
		? {
				licenseKey: string | null;
			}
		:
				| {
						/**
						 * @deprecated Use `licenseKey` instead
						 */
						apiKey: string | null;
				  }
				| {
						licenseKey: string | null;
				  };

export const registerUsageEvent = async ({
	host,
	succeeded,
	event,
	...apiOrLicenseKey
}: {
	host: string | null;
	succeeded: boolean;
	event: UsageEventType;
} & EitherApiKeyOrLicenseKey): Promise<RegisterUsageEventResponse> => {
	const abortController = new AbortController();
	const timeout = setTimeout(() => {
		abortController.abort();
	}, 10000);

	const apiKey = 'apiKey' in apiOrLicenseKey ? apiOrLicenseKey.apiKey : null;
	const licenseKey =
		'licenseKey' in apiOrLicenseKey ? apiOrLicenseKey.licenseKey : null;

	try {
		const res = await fetch(`${HOST}/api/track/register-usage-point`, {
			method: 'POST',
			body: JSON.stringify({
				event,
				apiKey: licenseKey ?? apiKey,
				host,
				succeeded,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			signal: abortController.signal,
		});
		clearTimeout(timeout);

		const json = (await res.json()) as ApiResponse;

		if (json.success) {
			return {
				billable: json.billable,
				classification: json.classification,
			};
		}

		if (!res.ok) {
			throw new Error(json.error);
		}

		throw new Error('Unexpected response from server');
	} catch (err) {
		if (isNetworkError(err as Error)) {
			// eslint-disable-next-line no-console
			console.log('Failed to send usage event', err);
		}

		clearTimeout(timeout);
		if (err instanceof Error && err.name === 'AbortError') {
			throw new Error('Request timed out after 10 seconds');
		}

		throw err;
	}
};
