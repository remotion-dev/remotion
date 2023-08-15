import {CliInternals} from '@remotion/cli';
import {getRegions} from '../../api/get-regions';
import {parsedLambdaCli} from '../args';

export const REGIONS_COMMAND = 'regions';

export const regionsCommand = () => {
	CliInternals.Log.info(
		getRegions({
			enabledByDefaultOnly: parsedLambdaCli['default-only'] ?? false,
		}).join(' ')
	);
};
