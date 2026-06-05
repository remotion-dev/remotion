import type {LogStudioErrorRequest} from '@remotion/studio-shared';
import {callApi} from '../../components/call-api';

const loggedErrors = new Set<string>();
const maxLoggedErrors = 100;

export const logStudioErrorData = (data: LogStudioErrorRequest) => {
	const key = JSON.stringify([data.name, data.message, data.stack]);

	if (loggedErrors.has(key)) {
		return;
	}

	if (loggedErrors.size >= maxLoggedErrors) {
		loggedErrors.clear();
	}

	loggedErrors.add(key);

	callApi('/api/log-studio-error', data).catch(() => undefined);
};

export const logStudioError = (error: Error) => {
	logStudioErrorData({
		name: typeof error.name === 'string' ? error.name : null,
		message: typeof error.message === 'string' ? error.message : '',
		stack: typeof error.stack === 'string' ? error.stack : null,
		symbolicatedStackFrames: null,
	});
};
