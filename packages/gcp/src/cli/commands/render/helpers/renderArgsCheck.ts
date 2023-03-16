import {CliInternals} from '@remotion/cli';
import {getCompositions} from '@remotion/renderer';
import {getOrCreateBucket} from '../../../../api/get-or-create-bucket';
import {BINARY_NAME} from '../../../../shared/constants';
import {validateServeUrl} from '../../../../shared/validate-serveurl';
import {parsedGcpCli} from '../../../args';
import {getGcpRegion} from '../../../get-gcp-region';
import {quit} from '../../../helpers/quit';
import {Log} from '../../../log';

export const renderArgsCheck = async (
	subcommand: string,
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
		Log.info(
			`${BINARY_NAME} ${subcommand} <serve-url> <cloud-run-url> <composition-id> [output-location]`
		);
		quit(1);
	}

	const cloudRunUrl = args[1];
	if (!cloudRunUrl) {
		Log.error('No Cloud Run Service URL passed.');
		Log.info(
			'Pass an additional argument specifying the endpoint of your Cloud Run Service.'
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${subcommand} <serve-url> <cloud-run-url> <composition-id> [output-location]`
		);
		quit(1);
	}

	let composition: string = args[2];
	if (!composition) {
		Log.info(
			`<serve-url> passed: ${serveUrl} 
<cloud-run-url> passed: ${cloudRunUrl}`
		);
		Log.info('No compositions passed. Fetching compositions...');

		validateServeUrl(serveUrl);
		const comps = await getCompositions(serveUrl);
		const {compositionId} = await CliInternals.selectComposition(comps);
		composition = compositionId;
	}

	const outName =
		parsedGcpCli['out-name'] ?? subcommand === 'still' ? 'out.png' : 'out.mp4'; // Todo, workout file extension instead of assuming mp4
	const downloadName = args[2] ?? null;

	const {codec} = CliInternals.getFinalCodec({
		downloadName,
		outName: outName ?? null,
	});

	const {inputProps} = await CliInternals.getCliOptions({
		type: 'series',
		isLambda: true, // TODO: what do I need to do with this?
		remotionRoot,
	});
	// const maxRetries = parsedGcpCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	// validateMaxRetries(maxRetries);

	// const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	// validatePrivacy(privacy);

	let outputBucket = parsedGcpCli['output-bucket'];
	if (!outputBucket) {
		const {bucketName} = await getOrCreateBucket({
			region: getGcpRegion(),
		});
		outputBucket = bucketName;
	}

	return {
		serveUrl,
		cloudRunUrl,
		composition,
		outName,
		codec,
		inputProps,
		outputBucket,
	};
};
