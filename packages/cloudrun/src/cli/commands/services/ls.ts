import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {displayServiceInfo} from '.';
import {getServices} from '../../../api/get-services';
import {getGcpRegion} from '../../get-gcp-region';
import {Log} from '../../log';

export const SERVICES_LS_SUBCOMMAND = 'ls';

export const servicesLsCommand = async (logLevel: LogLevel) => {
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

	if (CliInternals.quietFlagProvided()) {
		if (services.length === 0) {
			Log.info({indent: false, logLevel}, '()');
			return;
		}

		Log.info(
			{indent: false, logLevel},
			services.map((f) => f.serviceName).join(' '),
		);
		return;
	}

	fetchingOutput.update('Getting service info...', false);

	const pluralized = services.length === 1 ? 'service' : 'services';
	fetchingOutput.update(`${services.length} ${pluralized} in ${region}`, false);
	Log.info({indent: false, logLevel});

	for (const service of services) {
		Log.info({indent: false, logLevel});
		Log.info({indent: false, logLevel}, displayServiceInfo(service));
	}
};
