import {Log} from '@remotion/cli/dist/log';
import {getRegions} from '../../api/get-regions';
import {parsedLambdaCli} from '../args';

export const REGIONS_COMMAND = 'regions';

export const regionsCommand = () => {
	Log.info(
		getRegions({
			enabledByDefaultOnly: parsedLambdaCli['default-only'] ?? false,
		}).join(' ')
	);
};
