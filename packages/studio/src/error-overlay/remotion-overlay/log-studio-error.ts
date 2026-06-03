import {callApi} from '../../components/call-api';

const loggedErrors = new Set<string>();
const maxLoggedErrors = 100;

export const logStudioError = (error: Error) => {
	const name = typeof error.name === 'string' ? error.name : null;
	const message = typeof error.message === 'string' ? error.message : '';
	const stack = typeof error.stack === 'string' ? error.stack : null;
	const key = JSON.stringify([name, message, stack]);

	if (loggedErrors.has(key)) {
		return;
	}

	if (loggedErrors.size >= maxLoggedErrors) {
		loggedErrors.clear();
	}

	loggedErrors.add(key);

	callApi('/api/log-studio-error', {
		name,
		message,
		stack,
	}).catch(() => undefined);
};
