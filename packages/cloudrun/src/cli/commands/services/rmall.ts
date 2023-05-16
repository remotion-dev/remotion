import {CliInternals} from '@remotion/cli';
import {deleteService} from '../../../api/delete-service';
import {getServices} from '../../../api/get-services';
import {parsedCloudrunCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import {confirmCli} from '../../helpers/confirm';
import {Log} from '../../log';
import {displayServiceInfo} from './index';

export const SERVICES_RMALL_SUBCOMMAND = 'rmall';

export const servicesRmallCommand = async () => {
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

	const pluralized = services.length === 1 ? 'service' : 'services';
	fetchingOutput.update(`${services.length} ${pluralized} in ${region}`);
	Log.info();
	Log.info();

	for (const serv of services) {
		Log.info(displayServiceInfo(serv));
		Log.info();

		const confirmDelete = await confirmCli({
			delMessage: 'Delete? (Y/n)',
			allowForceFlag: true,
		});

		if (!confirmDelete) {
			Log.info(`Skipping service - ${serv.serviceName}.`);
			Log.info();
			continue;
		}

		const output = CliInternals.createOverwriteableCliOutput({
			quiet: CliInternals.quietFlagProvided(),
			cancelSignal: null,
		});
		output.update('Deleting...');
		await deleteService({region, serviceName: serv.serviceName});
		output.update('Deleted!\n');
	}
};
