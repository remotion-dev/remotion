import type {LogLevel} from '../log-level';
import {Log} from '../logger';
import type {
	LoadingFailedEvent,
	ResponseReceivedExtraInfoEvent,
} from './devtools-types';
import type {HTTPRequest} from './HTTPRequest';

const sensitiveHeaders = [
	'set-cookie',
	'cookie',
	'authorization',
	'proxy-authorization',
];

export const handleFailedResource = ({
	extraInfo,
	logLevel,
	indent,
	request,
	event,
}: {
	extraInfo: ResponseReceivedExtraInfoEvent[];
	logLevel: LogLevel;
	indent: boolean;
	request: HTTPRequest;
	event: LoadingFailedEvent;
}) => {
	const firstExtraInfo = extraInfo[0] ?? null;
	const statusCode =
		firstExtraInfo?.statusCode ?? request.response()?.status() ?? null;

	Log.warn(
		{indent, logLevel},
		`Browser failed to load ${request._url} (${event.type}): ${event.errorText}${
			statusCode === null ? '' : ` (HTTP status code ${statusCode})`
		}`,
	);
	if (firstExtraInfo) {
		Log.verbose(
			{indent, logLevel},
			'Response headers:',
			JSON.stringify(
				Object.fromEntries(
					Object.entries(firstExtraInfo.headers).map(([key, value]) => [
						key,
						sensitiveHeaders.includes(key.toLowerCase()) ? '<redacted>' : value,
					]),
				),
				null,
				2,
			),
		);
	}

	if (
		event.errorText === 'net::ERR_FAILED' &&
		event.type === 'Fetch' &&
		request._url?.includes('/proxy')
	) {
		Log.warn(
			{indent, logLevel},
			'This could be caused by Chrome rejecting the request because the disk space is low.',
		);
		Log.warn(
			{indent, logLevel},
			'Consider increasing the disk size of your Lambda function.',
		);
	}
};
