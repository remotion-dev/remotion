import {isMusl} from './compositor/get-executable-path';
import type {LogLevel} from './log-level';
import {Log} from './logger';

const getRequired = () => {
	if (process.platform !== 'linux') {
		return null;
	}

	if (isMusl({indent: false, logLevel: 'warn'})) {
		return null;
	}

	// Uses Amazon Linux 2 to compile
	if (process.arch === 'arm64') {
		return [2, 26];
	}

	// Uses Ubuntu 20.04 to compile
	return [2, 31];
};

const required = getRequired();

export const gLibCErrorMessage = (libCString: string) => {
	if (required === null) {
		return null;
	}

	const split = libCString.split('.');
	if (split.length !== 2) {
		return null;
	}

	if (split[0] === String(required[0]) && Number(split[1]) >= required[1]) {
		return null;
	}

	if (Number(split[0]) > required[0]) {
		return null;
	}

	return `Rendering videos requires glibc ${required.join(
		'.',
	)} on your or higher on your OS. Your system has glibc ${libCString}.`;
};

const checkLibCRequirement = (logLevel: LogLevel, indent: boolean) => {
	const {report} = process;
	if (report) {
		// @ts-expect-error no types
		const {glibcVersionRuntime} = report.getReport().header;
		if (!glibcVersionRuntime) {
			return;
		}

		const error = gLibCErrorMessage(glibcVersionRuntime as string);
		if (error) {
			Log.warn({logLevel, indent}, error);
		}
	}
};

export const checkNodeVersionAndWarnAboutRosetta = (
	logLevel: LogLevel,
	indent: boolean,
) => {
	const version = process.version.replace('v', '').split('.');
	const majorVersion = Number(version[0]);
	const requiredNodeVersion = 16;

	if (majorVersion < 16) {
		throw new Error(
			`Remotion requires at least Node ${requiredNodeVersion}. You currently have ${process.version}. Update your node version to ${requiredNodeVersion} to use Remotion.`,
		);
	}

	checkLibCRequirement(logLevel, indent);
};
