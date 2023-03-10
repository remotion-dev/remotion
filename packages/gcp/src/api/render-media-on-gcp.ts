import got from 'got';
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
	outputFile: string;
};

export type RenderMediaOnGcpOutput = {
	publicUrl: string;
	cloudStorageUri: string;
	size: string;
	bucketName: string;
	renderId: string;
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
	outputFile,
}: RenderMediaOnGcpInput): Promise<RenderMediaOnGcpOutput> => {
	const actualCodec = validateGcpCodec(codec);
	validateServeUrl(serveUrl);

	// todo: allow serviceName to be passed in, and fetch the cloud run URL based on the name

	const postData = {
		type: 'media',
		composition,
		serveUrl,
		codec: actualCodec,
		inputProps,
		outputBucket,
		outputFile,
	};

	const response: RenderMediaOnGcpOutput = await got
		.post(cloudRunUrl, {json: postData})
		.json();

	return response;
};
