import {NoReactInternals} from 'remotion/no-react';
import {cleanFnStore} from '../mocks/mock-functions';

let stdoutOutput: string[] = [];
let stderrOutput: string[] = [];

export const getProcessWriteOutput = () => {
	return stdoutOutput
		.filter(NoReactInternals.truthy)
		.map((c) => c.toString())
		.join('\n');
};

const originalStdout = process.stdout.write;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalStderr = process.stderr.write;

export const doBefore = () => {
	stdoutOutput = [];
	stderrOutput = [];
	cleanFnStore();
	// @ts-expect-error
	process.stdout.write = (str: string) => {
		//	originalStdout(str);
		stdoutOutput.push(str);
	};

	console.log = (...args: unknown[]) => {
		// originalStdout(args.join(' '));
		stdoutOutput.push(args.map(String).join(' '));
	};

	console.error = (...args: unknown[]) => {
		// originalStderr(args.join(' '));
		stderrOutput.push(args.map(String).join(' '));
	};

	// @ts-expect-error
	process.stderr.write = (str: string) => {
		// originalStderr(str);
		stderrOutput.push(str);
	};
};

export const doAfter = () => {
	process.stdout.write = originalStdout;
	process.stderr.write = originalStderr;
	console.log = originalConsoleLog;
	console.error = originalConsoleError;
};
