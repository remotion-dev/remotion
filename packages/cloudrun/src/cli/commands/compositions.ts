import {CliInternals} from '@remotion/cli';
import {getCompositionsOnGcp} from '../../api/get-compositions-on-gcp';
import {getOrCreateBucket} from '../../api/get-or-create-bucket';
import {BINARY_NAME} from '../../shared/constants';
import {validateServeUrl} from '../../shared/validate-serveurl';
import {quit} from '../helpers/quit';
import {Log} from '../log';

export const COMPOSITIONS_COMMAND = 'compositions';

export const compositionsCommand = async (args: string[]) => {
	const serveArg = args[0];

	if (!serveArg) {
		Log.error('No serve URL argument passed.');
		Log.info(
			'Pass an additional argument specifying a URL, or site name, where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(`${BINARY_NAME} ${COMPOSITIONS_COMMAND} <serve-url>`);
		quit(1);
	}

	let serveUrl = '';

	if (!serveArg.startsWith('https://') && !serveArg.startsWith('http://')) {
		const siteName = serveArg;
		Log.info('Remotion site-name passed, constructing serve url...');
		const {bucketName} = await getOrCreateBucket();
		serveUrl = `https://storage.googleapis.com/${bucketName}/sites/${siteName}/index.html`;
		Log.info(`<serve-url> constructed: ${serveUrl}\n`);
	} else {
		serveUrl = serveArg;
	}

	validateServeUrl(serveUrl);

	const comps = await getCompositionsOnGcp({
		serveUrl,
	});

	CliInternals.printCompositions(comps);
};
