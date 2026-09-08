import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {getRegions} from '../../api/get-regions';
import {parsedLambdaCli} from '../args';

export {REGIONS_COMMAND} from './command-names';

export const regionsCommand = (logLevel: LogLevel) => {
	CliInternals.Log.info(
		{indent: false, logLevel},
		getRegions({
			enabledByDefaultOnly: parsedLambdaCli['default-only'] ?? false,
		}).join(' '),
	);
};
