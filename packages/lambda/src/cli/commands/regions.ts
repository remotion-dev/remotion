import {Log} from '@remotion/cli/dist/log';
import {getRegions} from '../../api/get-regions';

export const REGIONS_COMMAND = 'regions';

export const regionsCommand = () => {
	Log.info(getRegions().join(' '));
};
