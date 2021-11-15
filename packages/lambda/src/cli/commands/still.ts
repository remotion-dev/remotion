import {CliInternals} from '@remotion/cli';
import {StillImageFormat} from 'remotion';
import {renderStillOnLambda} from '../../api/render-still-on-lambda';
import {
	BINARY_NAME,
	DEFAULT_MAX_RETRIES,
	DEFAULT_OUTPUT_PRIVACY,
} from '../../shared/constants';
import {validatePrivacy} from '../../shared/validate-privacy';
import {validateMaxRetries} from '../../shared/validate-retries';
import {parsedLambdaCli} from '../args';
import {getAwsRegion} from '../get-aws-region';
import {findFunctionName} from '../helpers/find-function-name';
import {quit} from '../helpers/quit';
import {Log} from '../log';

export const STILL_COMMAND = 'still';

export const stillCommand = async (args: string[]) => {
	const serveUrl = args[0];
	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(`${BINARY_NAME} ${STILL_COMMAND} <serve-url> <composition-id>`);
		quit(1);
	}

	const composition = args[1];
	if (!composition) {
		Log.error('No composition ID passed.');
		Log.info('Pass an additional argument specifying the composition ID.');
		Log.info();
		// TODO: Rename serveURL
		Log.info(`${BINARY_NAME} ${STILL_COMMAND} <serve-url> <composition-id>`);
		quit(1);
	}

	const cliOptions = await CliInternals.getCliOptions({
		type: 'still',
		isLambda: true,
	});

	const functionName = await findFunctionName();

	const maxRetries = parsedLambdaCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	validateMaxRetries(maxRetries);

	const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	validatePrivacy(privacy);

	const res = await renderStillOnLambda({
		functionName,
		serveUrl,
		inputProps: cliOptions.inputProps,
		imageFormat: cliOptions.imageFormat as StillImageFormat,
		composition,
		privacy,
		region: getAwsRegion(),
		maxRetries,
		envVariables: cliOptions.envVariables,
		frame: cliOptions.stillFrame,
		quality: cliOptions.quality,
		saveBrowserLogs: parsedLambdaCli['save-browser-logs'],
	});

	Log.info(`Finished video!`);
	Log.info();
	Log.info(res.url);
};
