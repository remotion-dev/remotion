import {validateCloudRunUrl} from '../../shared/validate-cloudrun-url';
import {validateRegion} from '../../shared/validate-region';
import {validateServiceName} from '../../shared/validate-service-name';
import {getServiceInfo} from '../get-service-info';

export type getCloudrunEndpointInput = {
	cloudRunUrl?: string | null;
	serviceName?: string | null;
	region?: string;
};

export const getCloudrunEndpoint = async ({
	cloudRunUrl,
	serviceName,
	region,
}: getCloudrunEndpointInput): Promise<string> => {
	if (!cloudRunUrl && !serviceName)
		throw new Error('Either cloudRunUrl or serviceName must be provided');
	if (cloudRunUrl && serviceName)
		throw new Error(
			'Either cloudRunUrl or serviceName must be provided, not both',
		);

	let cloudRunEndpoint = '';
	if (cloudRunUrl) {
		validateCloudRunUrl(cloudRunUrl);
		cloudRunEndpoint = cloudRunUrl;
	}

	if (serviceName) {
		if (!region)
			throw new Error(
				'If determining Cloudrun Url from serviceName, region must be provided',
			);
		validateServiceName(serviceName);
		const validatedRegion = validateRegion(region);
		const {uri} = await getServiceInfo({serviceName, region: validatedRegion});
		cloudRunEndpoint = uri;
	}

	return cloudRunEndpoint;
};
