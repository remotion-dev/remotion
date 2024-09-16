import type {LogLevel} from '../log-level';
import {Log} from '../logger';
import type {HTTPRequest} from './HTTPRequest';
import type {
	LoadingFailedEvent,
	ResponseReceivedExtraInfoEvent,
} from './devtools-types';

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

	Log.warn(
		{indent, logLevel},
		`Browser failed to load ${request._url} (${event.type}): ${event.errorText}`,
	);
	if (firstExtraInfo) {
		Log.warn(
			{indent, logLevel},
			`HTTP status code: ${firstExtraInfo.statusCode}, headers:`,
		);
		Log.warn(
			{indent, logLevel},
			JSON.stringify(firstExtraInfo.headers, null, 2),
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
			'This could be caused by Chrome rejecting the request because the disk space is low.',
		);
		Log.warn(
			{indent, logLevel},
			'Consider increasing the disk size of your Lambda function.',
		);
	}
};
