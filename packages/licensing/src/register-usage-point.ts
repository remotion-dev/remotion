export const HOST = 'https://www.remotion.pro';

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

export const registerUsageEvent = async ({
	apiKey,
	host,
	succeeded,
	event,
}: {
	apiKey: string | null;
	host: string | null;
	succeeded: boolean;
	event: UsageEventType;
}): Promise<RegisterUsageEventResponse> => {
	const res = await fetch(`${HOST}/api/track/register-usage-point`, {
		method: 'POST',
		body: JSON.stringify({
			event,
			apiKey,
			host,
			succeeded,
		}),
		headers: {
			'Content-Type': 'application/json',
		},
	});
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

	const read = await res.json();
	return read;
};
