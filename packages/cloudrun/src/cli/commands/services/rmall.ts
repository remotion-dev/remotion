import {CliInternals} from '@remotion/cli';
import {deleteService} from '../../../api/delete-service';
import {getServiceInfo} from '../../../api/get-service-info';
import {getServices} from '../../../api/get-services';
import {getGcpRegion} from '../../get-gcp-region';
import {confirmCli} from '../../helpers/confirm';
import {Log} from '../../log';

export const SERVICES_RMALL_SUBCOMMAND = 'rmall';
const LEFT_COL = 16;

export const servicesRmallCommand = async () => {
	const region = getGcpRegion();
	const services = await getServices({
		region,
		compatibleOnly: false,
	});

	for (const serv of services) {
		const infoOutput = CliInternals.createOverwriteableCliOutput({
			quiet: CliInternals.quietFlagProvided(),
			cancelSignal: null,
		});
		infoOutput.update('Getting service info...');
		const info = await getServiceInfo({
			region,
			serviceName: serv.serviceName,
		});

		infoOutput.update(
			[
				'Service name: '.padEnd(LEFT_COL, ' ') + ' ' + info.serviceName,
				'Version: '.padEnd(LEFT_COL, ' ') + ' ' + info.remotionVersion,
				'CPU Limit: '.padEnd(LEFT_COL, ' ') + ' ' + info.cpuLimit,
				'Memory Limit: '.padEnd(LEFT_COL, ' ') + ' ' + info.memoryLimit,
				'Timeout: '.padEnd(LEFT_COL, ' ') + ' ' + info.timeoutInSeconds + 'sec',
			].join('\n')
		);
		Log.info();

		const confirmDelete = await confirmCli({
			delMessage: 'Delete? (Y/n)',
			allowForceFlag: true,
		});

		if (!confirmDelete) {
			Log.info(`Skipping service - ${info.serviceName}.`);
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
