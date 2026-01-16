export const HOST = 'https://www.remotion.pro';
import type {NoReactInternals} from 'remotion/no-react';
import {isNetworkError} from './is-network-error';

const DEFAULT_MAX_RETRIES = 3;

export const exponentialBackoffMs = (attempt: number): number => {
	return 1000 * 2 ** (attempt - 1);
};

export const sleep = (ms: number): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

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
	isStill,
	isProduction,
	...apiOrLicenseKey
}: {
	host: string | null;
	succeeded: boolean;
	event: UsageEventType;
	isStill?: boolean;
	isProduction?: boolean;
} & EitherApiKeyOrLicenseKey): Promise<RegisterUsageEventResponse> => {
	const apiKey = 'apiKey' in apiOrLicenseKey ? apiOrLicenseKey.apiKey : null;
	const licenseKey =
		'licenseKey' in apiOrLicenseKey ? apiOrLicenseKey.licenseKey : null;

	let lastError: Error | undefined;
	const totalAttempts = DEFAULT_MAX_RETRIES + 1;

	for (let attempt = 1; attempt <= totalAttempts; attempt++) {
		const abortController = new AbortController();
		const timeout = setTimeout(() => {
			abortController.abort();
		}, 10000);

		try {
			const res = await fetch(`${HOST}/api/track/register-usage-point`, {
				method: 'POST',
				body: JSON.stringify({
					event,
					apiKey: licenseKey ?? apiKey,
					host,
					succeeded,
					isStill: isStill ?? false,
					isProduction: isProduction ?? undefined,
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

			throw new Error(
				`Unexpected response from server: ${JSON.stringify(json)}`,
			);
		} catch (err) {
			clearTimeout(timeout);

			const error = err as Error;
			const isTimeout = error.name === 'AbortError';
			const isRetryable = isNetworkError(error) || isTimeout;

			if (!isRetryable) {
				throw err;
			}

			lastError = isTimeout
				? new Error('Request timed out after 10 seconds')
				: error;

			if (attempt < totalAttempts) {
				const backoffMs = exponentialBackoffMs(attempt);
				// eslint-disable-next-line no-console
				console.log(
					`Failed to send usage event (attempt ${attempt}/${totalAttempts}), retrying in ${backoffMs}ms...`,
					err,
				);
				await sleep(backoffMs);
			}
		}
	}

	throw lastError;
};
