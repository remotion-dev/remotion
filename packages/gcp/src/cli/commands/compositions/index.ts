import {CliInternals} from '@remotion/cli';
import {getCompositionsOnGcp} from '../../../api/get-compositions-on-gcp';
import {BINARY_NAME} from '../../../shared/constants';
import {validateServeUrl} from '../../../shared/validate-serveurl';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const COMPOSITIONS_COMMAND = 'compositions';

export const compositionsCommand = async (
	args: string[],
	remotionRoot: string
) => {
	const serveUrl = args[0];

	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(`${BINARY_NAME} ${COMPOSITIONS_COMMAND} <serve-url>`);
		quit(1);
	}

	validateServeUrl(serveUrl);

	const comps = await getCompositionsOnGcp({
		serveUrl
	});

	CliInternals.printCompositions(comps);
};
