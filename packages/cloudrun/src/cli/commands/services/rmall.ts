import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {deleteService} from '../../../api/delete-service';
import {getServices} from '../../../api/get-services';
import {getGcpRegion} from '../../get-gcp-region';
import {confirmCli} from '../../helpers/confirm';
import {Log} from '../../log';
import {displayServiceInfo} from './index';

export const SERVICES_RMALL_SUBCOMMAND = 'rmall';

export const servicesRmallCommand = async (logLevel: LogLevel) => {
	const region = getGcpRegion();

	const fetchingOutput = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		updatesDontOverwrite: false,
		indent: false,
	});
	fetchingOutput.update(`Getting services in ${region}...`, false);

	const services = await getServices({
		region,
		compatibleOnly: false,
	});

	const pluralized = services.length === 1 ? 'service' : 'services';
	fetchingOutput.update(`${services.length} ${pluralized} in ${region}`, false);
	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel});

	for (const serv of services) {
		Log.info({indent: false, logLevel}, displayServiceInfo(serv));
		Log.info({indent: false, logLevel});

		const confirmDelete = await confirmCli({
			delMessage: 'Delete? (Y/n)',
			allowForceFlag: true,
		});

		if (!confirmDelete) {
			Log.info(
				{indent: false, logLevel},
				`Skipping service - ${serv.serviceName}.`,
			);
			Log.info({indent: false, logLevel});
			continue;
		}

		const output = CliInternals.createOverwriteableCliOutput({
			quiet: CliInternals.quietFlagProvided(),
			cancelSignal: null,
			updatesDontOverwrite: false,
			indent: false,
		});
		output.update('Deleting...', false);
		await deleteService({region: serv.region, serviceName: serv.serviceName});
		output.update('Deleted!\n', false);
	}
};
