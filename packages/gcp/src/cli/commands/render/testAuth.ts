import {testAuth} from '../../../api/testCall';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const TEST_AUTH_SUBCOMMAND = 'test';

export const testAuthSubcommand = async (args: string[]) => {
	const cloudRunUrl = args[0];

	if (!cloudRunUrl) {
		Log.error('No Cloud Run Service URL passed.');
		Log.info(
			'Pass an additional argument specifying the endpoint of your Cloud Run Service.'
		);
		quit(1);
	}

	await testAuth({
		cloudRunUrl,
	});
};
