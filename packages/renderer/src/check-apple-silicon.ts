import type {LogLevel} from './log-level';
import {Log} from './logger';

export const gLibCErrorMessage = (libCString: string) => {
	const split = libCString.split('.');
	if (split.length !== 2) {
		return null;
	}

	if (split[0] === '2' && Number(split[1]) >= 35) {
		return null;
	}

	if (Number(split[0]) > 2) {
		return null;
	}

	return `Remotion requires glibc 2.35 or higher. Your system has glibc ${libCString}.`;
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
