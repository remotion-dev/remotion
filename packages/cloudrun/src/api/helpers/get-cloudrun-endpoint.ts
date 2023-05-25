import {validateCloudRunUrl} from '../../shared/validate-cloudrun-url';
import {validateRegion} from '../../shared/validate-region';
import {validateServiceName} from '../../shared/validate-service-name';
import {getServiceInfo} from '../get-service-info';

export type getCloudrunEndpointInput = {
	cloudRunUrl?: string;
	serviceName?: string;
	region?: string;
};

/**
 * @description If the Cloud Run URL is passed, it will be validated and returned. If the service name is passed, the service will be looked up and the endpoint will be returned.
 * @see [Documentation](https://remotion.dev/docs/lambda/renderMediaOnGcp)
 * @param params.cloudRunUrl The url of the Cloud Run service
 * @param params.serviceName The name of the Cloud Run service
 * @param params.region The region of the service - required if the serviceName is passed.
 * @returns {Promise<string>} Returns the endpoint of the Cloud Run service
 */

export const getCloudrunEndpoint = async ({
	cloudRunUrl,
	serviceName,
	region,
}: getCloudrunEndpointInput): Promise<string> => {
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
