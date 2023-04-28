import {CliInternals} from '@remotion/cli';
import {getServices} from '../../../api/get-services';
import {getGcpRegion} from '../../get-gcp-region';

const NAME_COLS = 70;
const RESOURCE_LIMIT_COLS = 15;
const DISK_COLS = 15;
const TIMEOUT_COLS = 15;
const VERSION_COLS = 15;

export const SERVICES_LS_SUBCOMMAND = 'ls';

export const servicesLsCommand = async () => {
	const region = getGcpRegion();
	const fetchingOutput = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
	});
	fetchingOutput.update('Getting services...');

	const services = await getServices({
		region,
		compatibleOnly: false,
	});

	if (CliInternals.quietFlagProvided()) {
		if (services.length === 0) {
			CliInternals.Log.info('()');
			return;
		}

		CliInternals.Log.info(services.map((f) => f.serviceName).join(' '));
		return;
	}

	fetchingOutput.update('Getting service info...');

	const pluralized = services.length === 1 ? 'service' : 'services';
	fetchingOutput.update(
		`${services.length} ${pluralized} in the ${region} region`
	);
	CliInternals.Log.info();
	CliInternals.Log.info(
		CliInternals.chalk.gray(
			[
				'Name'.padEnd(NAME_COLS, ' '),
				'Version'.padEnd(VERSION_COLS, ' '),
				'CPU Limit'.padEnd(RESOURCE_LIMIT_COLS, ' '),
				'Memory Limit'.padEnd(RESOURCE_LIMIT_COLS, ' '),
				'Timeout (sec)'.padEnd(TIMEOUT_COLS, ' '),
			].join('')
		)
	);

	for (const datapoint of services) {
		CliInternals.Log.info(
			[
				datapoint.serviceName.padEnd(NAME_COLS, ' '),
				datapoint.remotionVersion
					? datapoint.remotionVersion.padEnd(VERSION_COLS, ' ')
					: 'Error'.padEnd(VERSION_COLS, ' '),
				String(datapoint.cpuLimit).padEnd(DISK_COLS, ' '),
				String(datapoint.memoryLimit).padEnd(RESOURCE_LIMIT_COLS, ' '),
				String(datapoint.timeoutInSeconds).padEnd(TIMEOUT_COLS, ' '),
			].join('')
		);
	}
};
