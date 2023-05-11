import {CliInternals} from '@remotion/cli';

import {getCompositions} from '@remotion/renderer';
import {getOrCreateBucket} from '../../../../api/get-or-create-bucket';
import {getServiceInfo} from '../../../../api/get-service-info';
import {
	BINARY_NAME,
	DEFAULT_OUTPUT_PRIVACY,
} from '../../../../shared/constants';
import {validatePrivacy} from '../../../../shared/validate-privacy';
import {validateServeUrl} from '../../../../shared/validate-serveurl';
import {parsedCloudrunCli} from '../../../args';
import {getGcpRegion} from '../../../get-gcp-region';
import {quit} from '../../../helpers/quit';
import {Log} from '../../../log';

export const renderArgsCheck = async (subcommand: string, args: string[]) => {
	let region;

	let serveUrl = args[0];
	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${subcommand} <serve-url> <composition-id> [output-location]`
		);
		quit(1);
	}

	if (!serveUrl.startsWith('https://') && !serveUrl.startsWith('http://')) {
		const siteName = serveUrl;
		Log.info('Remotion site-name passed, constructing serve url...');
		const {bucketName} = await getOrCreateBucket();
		serveUrl = `https://storage.googleapis.com/${bucketName}/sites/${siteName}/index.html`;
		Log.info(`<serve-url> constructed: ${serveUrl}\n`);
	}

	let composition: string = args[1];
	if (!composition) {
		Log.info(
			`No compositions passed. Fetching compositions for ${serveUrl}...`
		);

		validateServeUrl(serveUrl);
		const comps = await getCompositions(serveUrl);
		const {compositionId} = await CliInternals.selectComposition(comps);
		composition = compositionId;
	}

	const outName = parsedCloudrunCli['out-name'];
	const downloadName = args[2] ?? null;

	const privacy = parsedCloudrunCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	validatePrivacy(privacy);

	let outputBucket = parsedCloudrunCli['output-bucket'];
	if (!outputBucket) {
		region = region ?? getGcpRegion();

		const {bucketName} = await getOrCreateBucket({
			region,
		});
		outputBucket = bucketName;
	}

	let cloudRunUrl = parsedCloudrunCli['cloud-run-url'];
	const serviceName = parsedCloudrunCli['service-name'];
	if ((cloudRunUrl && serviceName) || (!cloudRunUrl && !serviceName)) {
		if (cloudRunUrl && serviceName) {
			Log.error('Both a Cloud Run URL and a Service Name was provided.');
		} else {
			Log.error('Neither a Cloud Run URL nor a Service Name was provided.');
		}

		Log.info(
			'To render on GCP, provide either the Service Name or the Cloud Run URL endpoint of the service you want to use.'
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${subcommand} <serve-url> <composition-id> [output-location] --cloud-run-url=<url>`
		);
		Log.info('or');
		Log.info(
			`${BINARY_NAME} ${subcommand} <serve-url> <composition-id> [output-location] --service-name=<name>`
		);
		quit(1);
	}

	if (serviceName) {
		Log.info('Cloud Run service name passed, fetching Cloud Run url...');
		region = region ?? getGcpRegion();
		const {uri} = await getServiceInfo({serviceName, region});
		console.log('cloud run url found: ', uri);
		cloudRunUrl = uri;
	}

	const authenticatedRequest = !parsedCloudrunCli['unauthenticated-request'];

	return {
		serveUrl,
		cloudRunUrl,
		composition,
		outName,
		outputBucket,
		privacy,
		authenticatedRequest,
		downloadName,
	};
};
