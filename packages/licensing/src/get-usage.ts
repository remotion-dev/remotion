import {HOST} from './register-usage-point';

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
	apiKey,
	since,
}: {
	apiKey: string;
	since?: number | null;
}): Promise<GetUsageResponse> => {
	const res = await fetch(`${HOST}/api/track/get-usage`, {
		method: 'POST',
		body: JSON.stringify({
			apiKey,
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
