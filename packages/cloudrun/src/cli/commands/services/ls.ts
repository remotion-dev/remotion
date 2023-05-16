import {CliInternals} from '@remotion/cli';
import {displayServiceInfo} from '.';
import {getServices} from '../../../api/get-services';
import {parsedCloudrunCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import {Log} from '../../log';

export const SERVICES_LS_SUBCOMMAND = 'ls';

export const servicesLsCommand = async () => {
	const allRegions = parsedCloudrunCli['all-regions'];

	const region = allRegions ? 'all regions' : getGcpRegion();
	const fetchingOutput = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
	});
	fetchingOutput.update(`Getting services in ${region}...`);

	const services = await getServices({
		region,
		compatibleOnly: false,
	});

	if (CliInternals.quietFlagProvided()) {
		if (services.length === 0) {
			Log.info('()');
			return;
		}

		Log.info(services.map((f) => f.serviceName).join(' '));
		return;
	}

	fetchingOutput.update('Getting service info...');

	const pluralized = services.length === 1 ? 'service' : 'services';
	fetchingOutput.update(`${services.length} ${pluralized} in ${region}`);
	Log.info();

	for (const service of services) {
		Log.info();
		Log.info(displayServiceInfo(service));
	}
};
