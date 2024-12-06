const HOST = 'http://localhost:51748/';

type ApiResponse =
	| {
			success: true;
			billable: boolean;
			classification: Classification;
	  }
	| {
			success: false;
			error: string;
	  };

export type TrackWebCodecConversionResponse = {
	success: true;
	billable: boolean;
	classification: Classification;
};

type CompanyLicenseUsageEvent = 'webcodec-conversion' | 'cloud-render';

export type Classification = 'billable' | 'development' | 'failed';

export const registerCompanyLicenseUsageEvent = async ({
	apiKey,
	host,
	succeeded,
	event,
}: {
	apiKey: string;
	host: string;
	succeeded: boolean;
	event: CompanyLicenseUsageEvent;
}): Promise<TrackWebCodecConversionResponse> => {
	const res = await fetch(`${HOST}/api/track`, {
		method: 'POST',
		body: JSON.stringify({
			event: event,
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
			success: true,
			classification: json.classification,
		};
	}

	if (!res.ok) {
		throw new Error(json.error);
	}

	const read = await res.json();
	return read;
};
