import execa from 'execa';
import type {SpawnOptionsWithoutStdio} from 'node:child_process';
import {spawn} from 'node:child_process';
import path from 'path';
import {getExecutablePath} from './compositor/get-executable-path';
import {getExplicitEnv} from './compositor/get-explicit-env';
import {makeFileExecutableIfItIsNot} from './compositor/make-file-executable';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';
import {truthy} from './truthy';

export const callFf = ({
	args,
	bin,
	indent,
	logLevel,
	options,
	binariesDirectory,
	cancelSignal,
}: {
	bin: 'ffmpeg' | 'ffprobe';
	args: (string | null)[];
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
	options?: execa.Options<string>;
}) => {
	const executablePath = getExecutablePath({
		type: bin,
		indent,
		logLevel,
		binariesDirectory,
	});
	makeFileExecutableIfItIsNot(executablePath);

	const cwd = path.dirname(executablePath);

	const task = execa(executablePath, args.filter(truthy), {
		cwd,
		env: getExplicitEnv(cwd),
		...options,
	});

	cancelSignal?.(() => {
		task.kill();
	});

	return task;
};

export const callFfNative = ({
	args,
	bin,
	indent,
	logLevel,
	options,
	binariesDirectory,
	cancelSignal,
}: {
	bin: 'ffmpeg' | 'ffprobe';
	args: (string | null)[];
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
	options?: SpawnOptionsWithoutStdio;
}) => {
	const executablePath = getExecutablePath({
		type: bin,
		indent,
		logLevel,
		binariesDirectory,
	});
	makeFileExecutableIfItIsNot(executablePath);

	const cwd = path.dirname(executablePath);

	const task = spawn(executablePath, args.filter(truthy), {
		cwd,
		env: getExplicitEnv(cwd),
		...options,
	});

	cancelSignal?.(() => {
		task.kill();
	});

	return task;
};
