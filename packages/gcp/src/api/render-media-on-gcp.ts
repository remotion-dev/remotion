import {Log} from '../cli/log';
import type {GcpCodec} from '../shared/validate-gcp-codec';
import {validateGcpCodec} from '../shared/validate-gcp-codec';
import {validateServeUrl} from '../shared/validate-serveurl';

export type RenderMediaOnGcpInput = {
	cloudRunUrl: string;
	// serviceName?: string;
	serveUrl: string;
	composition: string;
	inputProps?: unknown;
	codec: GcpCodec;
	outputBucket: string;
	outputFolderPath: string;
	outName: string;
};

export type RenderMediaOnGcpOutput = {
	renderId: string;
	bucketName: string;
	// cloudWatchLogs: string;
	folderInGcpConsole: string;
};

/**
 * @description Triggers a render on a GCP Cloud Run service given a composition and a Cloud Run URL.
 * @see [Documentation](https://remotion.dev/docs/lambda/renderMediaOnGcp)
 * @param params.cloudRunUrl The url of the Cloud Run service that should be used
 * @param params.serviceName The name of the Cloud Run service that should be used
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.codec The media codec which should be used for encoding.
 * @param params.outputBucket The name of the GCP Storage Bucket that will store the rendered media output.
 * @param params.outputFolderPath The folder path of the GCP Storage Bucket that will store the rendered media output.
 * @param params.outName The file name of the rendered media output.
 * @returns {Promise<RenderMediaOnGcpOutput>} See documentation for detailed structure
 */

export const renderMediaOnGcp = async ({
	cloudRunUrl,
	// serviceName,
	serveUrl,
	composition,
	inputProps,
	codec,
	outputBucket,
	outputFolderPath,
	outName,
}: RenderMediaOnGcpInput): Promise<RenderMediaOnGcpOutput> => {
	const actualCodec = validateGcpCodec(codec);
	validateServeUrl(serveUrl);

	// todo: allow serviceName to be passed in, and fetch the cloud run URL based on the name

	try {
		const postData = JSON.stringify({
			type: 'media',
			composition,
			serveUrl,
			codec: actualCodec,
			inputProps,
			outputBucket,
			outputFile: `${outputFolderPath}${outName}`,
		});
		// Log.info(`Posting11: ${postData} to ${cloudRunUrl}`);

		const response = await fetch(cloudRunUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(postData),
		});

		Log.info('response from Cloud Run 👇');
		Log.info(JSON.stringify(response.json()));

		return {
			renderId: 'res.renderId',
			bucketName: 'res.bucketName',
			// cloudWatchLogs: getCloudwatchStreamUrl({
			// 	functionName,
			// 	method: LambdaRoutines.renderer,
			// 	region,
			// 	renderId: res.renderId,
			// 	rendererFunctionName: rendererFunctionName ?? null,
			// }),
			folderInGcpConsole: 'folderInGcpConsole',
		};
	} catch (e: any) {
		// eslint-disable-next-line no-console
		console.error('Error rendering media on GCP');
		throw e;
	}
};
