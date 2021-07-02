import {FAILED_TO_LAUNCH_TOKEN} from './inspect-errors';

export const isFatalError = (err: string) => {
	if (err.includes(FAILED_TO_LAUNCH_TOKEN)) {
		return false;
	}

	return true;
};
