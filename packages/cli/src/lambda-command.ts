import type {LogLevel} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import {Log} from './log';

export const tryPrintLambdaHelp = (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	let path: string;
	try {
		path = require.resolve('@remotion/lambda/internal/help', {
			paths: [remotionRoot],
		});
	} catch {
		return false;
	}

	try {
		const {printHelp} = require(path);
		if (typeof printHelp !== 'function') {
			return false;
		}

		printHelp(args, logLevel);
		return true;
	} catch {
		return false;
	}
};

export const lambdaCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	try {
		const path = require.resolve('@remotion/lambda', {
			paths: [remotionRoot],
		});
		const {LambdaInternals} = require(path);

		await LambdaInternals.executeCommand(
			args,
			remotionRoot,
			logLevel,
			null,
			null,
		);
		process.exit(0);
	} catch (err) {
		const manager = StudioServerInternals.getPackageManager({
			remotionRoot,
			packageManager: undefined,
			dirUp: 0,
			logLevel,
		});
		const installCommand =
			manager === 'unknown' ? 'npm i' : manager.installCommand;
		Log.error({indent: false, logLevel}, err);
		Log.error({indent: false, logLevel}, 'Remotion Lambda is not installed.');
		Log.info({indent: false, logLevel}, '');
		Log.info({indent: false, logLevel}, 'You can install it using:');
		Log.info(
			{indent: false, logLevel},
			`${installCommand} @remotion/lambda@${StudioServerInternals.getRemotionVersion()}`,
		);
		process.exit(1);
	}
};
