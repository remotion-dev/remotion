import {NoReactInternals} from 'remotion/no-react';
import {isMusl} from './compositor/get-executable-path';
import type {LogLevel} from './log-level';
import {Log} from './logger';

const getRequiredLibCVersion = () => {
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

const required = getRequiredLibCVersion();

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
	if (process.platform === 'win32' || process.platform === 'darwin') {
		return;
	}

	const {report} = process;
	if (report) {
		const rep = report.getReport();
		if (typeof rep === 'string') {
			Log.warn(
				{logLevel, indent},
				'Bun limitation: process.report.getReport() ' + rep,
			);
			return;
		}

		// @ts-expect-error no types
		const {glibcVersionRuntime} = rep.header;
		if (!glibcVersionRuntime) {
			return;
		}

		const error = gLibCErrorMessage(glibcVersionRuntime as string);
		if (error) {
			Log.warn({logLevel, indent}, error);
		}
	}
};

const checkNodeVersion = () => {
	const version = process.version.replace('v', '').split('.');
	const majorVersion = Number(version[0]);

	if (majorVersion < NoReactInternals.MIN_NODE_VERSION) {
		throw new Error(
			`Remotion requires at least Node ${NoReactInternals.MIN_NODE_VERSION}. You currently have ${process.version}. Update your node version to ${NoReactInternals.MIN_NODE_VERSION} to use Remotion.`,
		);
	}
};

const checkBunVersion = () => {
	if (
		!Bun.semver.satisfies(Bun.version, `>=${NoReactInternals.MIN_BUN_VERSION}`)
	) {
		throw new Error(
			`Remotion requires at least Bun ${NoReactInternals.MIN_BUN_VERSION}. You currently have ${Bun.version}. Update your Bun version to ${NoReactInternals.MIN_BUN_VERSION} to use Remotion.`,
		);
	}
};

export const checkRuntimeVersion = (logLevel: LogLevel, indent: boolean) => {
	if (typeof Bun === 'undefined') {
		checkNodeVersion();
	} else {
		checkBunVersion();
	}

	checkLibCRequirement(logLevel, indent);
};
