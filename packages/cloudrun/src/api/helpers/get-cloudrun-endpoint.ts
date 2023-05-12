import {validateCloudRunUrl} from '../../shared/validate-cloudrun-url';
import {validateRegion} from '../../shared/validate-region';
import {validateServiceName} from '../../shared/validate-service-name';
import {getServiceInfo} from '../get-service-info';

export type RenderMediaOnCloudrunInput = {
	cloudRunUrl?: string;
	serviceName?: string;
	region?: string;
};

/**
 * @description Triggers a render on a GCP Cloud Run service given a composition and a Cloud Run URL.
 * @see [Documentation](https://remotion.dev/docs/lambda/renderMediaOnGcp)
 * @param params.cloudRunUrl The url of the Cloud Run service that should be used
 * @param params.serviceName The name of the Cloud Run service that should be used
 * @param params.serveUrl The URL of the deployed project
 * @returns {Promise<string>} See documentation for detailed structure
 */

export const getCloudrunEndpoint = async ({
	cloudRunUrl,
	serviceName,
	region,
}: RenderMediaOnCloudrunInput): Promise<string> => {
	if (!cloudRunUrl && !serviceName)
		throw new Error('Either cloudRunUrl or serviceName must be provided');
	if (cloudRunUrl && serviceName)
		throw new Error(
			'Either cloudRunUrl or serviceName must be provided, not both'
		);

	let cloudRunEndpoint = '';
	if (cloudRunUrl) {
		validateCloudRunUrl(cloudRunUrl);
		cloudRunEndpoint = cloudRunUrl;
	}

	if (serviceName) {
		if (!region)
			throw new Error(
				'If determining Cloudrun Url from serviceName, region must be provided'
			);
		validateServiceName(serviceName);
		const validatedRegion = validateRegion(region);
		const {uri} = await getServiceInfo({serviceName, region: validatedRegion});
		cloudRunEndpoint = uri;
	}

	return cloudRunEndpoint;
};
