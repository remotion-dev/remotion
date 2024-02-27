import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {GCP_REGIONS} from '../../regions';

export const REGIONS_COMMAND = 'regions';

export const regionsCommand = (logLevel: LogLevel) => {
	CliInternals.Log.info({indent: false, logLevel}, GCP_REGIONS.join(' '));
};
