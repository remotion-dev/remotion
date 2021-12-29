import * as tty from 'tty';

const argv = process.argv || [];
const env = process.env || {};

const isDisabled = 'NO_COLOR' in env || argv.includes('--no-color');
const isForced = 'FORCE_COLOR' in env || argv.includes('--color');
const isWindows = process.platform === 'win32';

const isCompatibleTerminal =
	tty?.isatty?.(1) && env.TERM && env.TERM !== 'dumb';

const isCI =
	'CI' in env &&
	('GITHUB_ACTIONS' in env || 'GITLAB_CI' in env || 'CIRCLECI' in env);

export const isColorSupported =
	!isDisabled && (isForced || isWindows || isCompatibleTerminal || isCI);
