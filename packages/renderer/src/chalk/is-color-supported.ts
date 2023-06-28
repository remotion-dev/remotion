import * as tty from 'tty';

export const isColorSupported = () => {
	const env = process.env || {};

	const isForceDisabled = 'NO_COLOR' in env;

	if (isForceDisabled) {
		return false;
	}

	const isForced = 'FORCE_COLOR' in env;
	if (isForced) {
		return true;
	}

	const isWindows = process.platform === 'win32';

	const isCompatibleTerminal =
		tty?.isatty?.(1) && env.TERM && env.TERM !== 'dumb';

	const isCI =
		'CI' in env &&
		('GITHUB_ACTIONS' in env || 'GITLAB_CI' in env || 'CIRCLECI' in env);

	return isWindows || isCompatibleTerminal || isCI;
};
