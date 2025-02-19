// If someone passes --log=verbose to npm run render
// We don't receive it.

import type {LogLevel} from '@remotion/renderer';
import {Log} from './log';

export const checkForNpmRunFlagPass = ({
	indent,
	logLevel,
}: {
	indent: boolean;
	logLevel: LogLevel;
}) => {
	if (!process.env.npm_config_log) {
		return;
	}

	Log.error(
		{indent, logLevel},
		`The environment variable "npm_config_log" is set to "${process.env.npm_config_log}".`,
	);
	Log.error({indent, logLevel}, `This indicates a likely mistake:`);
	Log.error(
		{
			indent,
			logLevel,
		},
		`--log gets passed to the npm command, however npm has no "log" configuration option.`,
	);
	Log.error(
		{
			indent,
			logLevel,
		},
		`You most likely wanted to pass --log to the Remotion CLI.`,
	);
	Log.error(
		{
			indent,
			logLevel,
		},
		`However, arguments passed to "npm run" don't get received by the script, in this case Remotion.`,
	);
	Log.error(
		{
			indent,
			logLevel,
		},
		`Edit the npm script and pass Remotion flags to "remotion" command instead. Example:`,
	);
	Log.error({
		indent,
		logLevel,
	});
	Log.error(
		{
			indent,
			logLevel,
		},
		`  "render": "remotion render --log=verbose"`,
	);
	Log.error({
		indent,
		logLevel,
	});

	process.exit(1);
};
