import {CliInternals} from '@remotion/cli';
import {GCP_REGIONS} from '../../regions';

export const REGIONS_COMMAND = 'regions';

export const regionsCommand = () => {
	CliInternals.Log.info(GCP_REGIONS.join(' '));
};
