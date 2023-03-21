import {GoogleAuth} from 'google-auth-library';
import got from 'got';
import {validateCloudRunUrl} from '../shared/validate-cloudrun-url';
import {validateServeUrl} from '../shared/validate-serveurl';
import {parseCloudRunUrl} from './helpers/parse-cloud-run-url';

export type RenderStillOnGcpInput = {
	authenticatedRequest: boolean;
	cloudRunUrl: string;
	// serviceName?: string;
	serveUrl: string;
	composition: string;
	inputProps?: unknown;
	outputBucket: string;
	outputFile: string;
};

export type RenderStillOnGcpOutput = {
	publicUrl: string;
	cloudStorageUri: string;
	size: string;
	bucketName: string;
	renderId: string;
	status: string;
	errMessage: string;
	error: any;
};

export type RenderStillOnGcpErrOutput = {
	message: string;
	error: any;
	status: string;
};

/**
 * @description Triggers a render on a GCP Cloud Run service given a composition and a Cloud Run URL.
 * @see [Documentation](https://remotion.dev/docs/lambda/renderStillOnGcp)
 * @param params.authenticatedRequest If this is an authenticated request, .env file will be checked for GCP credentials
 * @param params.cloudRunUrl The url of the Cloud Run service that should be used
 * @param params.serviceName The name of the Cloud Run service that should be used
 * @param params.serveUrl The URL of the deployed project
 * @param params.composition The ID of the composition which should be rendered.
 * @param params.inputProps The input props that should be passed to the composition.
 * @param params.outputBucket The name of the GCP Storage Bucket that will store the rendered media output.
 * @param params.outputFolderPath The folder path of the GCP Storage Bucket that will store the rendered media output.
 * @param params.outName The file name of the rendered media output.
 * @returns {Promise<RenderStillOnGcpOutput>} See documentation for detailed structure
 */

export const renderStillOnGcp = async ({
	authenticatedRequest,
	cloudRunUrl,
	// serviceName,
	serveUrl,
	composition,
	inputProps,
	outputBucket,
	outputFile,
}: RenderStillOnGcpInput): Promise<
	RenderStillOnGcpOutput | RenderStillOnGcpErrOutput
> => {
	validateServeUrl(serveUrl);
	validateCloudRunUrl(cloudRunUrl);

	const cloudRunInfo = parseCloudRunUrl(cloudRunUrl);

	// todo: allow serviceName to be passed in, and fetch the cloud run URL based on the name

	const data = {
		type: 'still',
		composition,
		serveUrl,
		inputProps,
		outputBucket,
		outputFile,
	};

	if (authenticatedRequest) {
		const auth = new GoogleAuth({
			credentials: {
				client_email: process.env.REMOTION_GCP_CLIENT_EMAIL,
				private_key: process.env.REMOTION_GCP_PRIVATE_KEY,
			},
		});
		const client = await auth.getIdTokenClient(cloudRunUrl);

		try {
			const response = await client.request({
				url: cloudRunUrl,
				method: 'POST',
				data,
			});
			return response.data as RenderStillOnGcpOutput;
		} catch (e) {
			return {
				// TODO: How do we get the project ID?
				message: `Cloud Run Service failed. View logs at https://console.cloud.google.com/run/detail/${cloudRunInfo.region}/${cloudRunInfo.serviceName}/logs?project={PROJECT_ID}`,
				error: e,
				status: 'error',
			};
		}
	} else {
		try {
			const response: RenderStillOnGcpOutput = await got
				.post(cloudRunUrl, {json: data})
				.json();
			return response;
		} catch (e) {
			return {
				// TODO: How do we get the project ID?
				message: `Cloud Run Service failed. View logs at https://console.cloud.google.com/run/detail/${cloudRunInfo.region}/${cloudRunInfo.serviceName}/logs?project={PROJECT_ID}`,
				error: e,
				status: 'error',
			};
		}
	}
};
