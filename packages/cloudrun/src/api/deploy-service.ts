import {
	DEFAULT_MAX_INSTANCES,
	DEFAULT_MIN_INSTANCES,
	DEFAULT_TIMEOUT,
} from '../shared/constants';
import {generateServiceName} from '../shared/generate-service-name';
import {validateGcpRegion} from '../shared/validate-gcp-region';
import {validateImageRemotionVersion} from '../shared/validate-image-remotion-version';
import {validateProjectID} from '../shared/validate-project-id';
import {checkIfServiceExists} from './check-if-service-exists';
import {constructServiceTemplate} from './helpers/construct-service-deploy-request';
import {getCloudRunClient} from './helpers/get-cloud-run-client';

export type DeployServiceInput = {
	performImageVersionValidation?: boolean;
	memoryLimit?: string;
	cpuLimit?: string;
	timeoutSeconds?: number;
	minInstances?: number;
	maxInstances?: number;
	projectID: string;
	region: string;
};

export type DeployServiceOutput = {
	fullName: string | null | undefined;
	shortName: string | null | undefined;
	uri: string;
	alreadyExists: boolean;
};

/**
 * @description Creates a Cloud Run service in your project that will be able to render a video in GCP.
 * @link https://remotion.dev/docs/cloudrun/deployservice
 * @param params.performImageVersionValidation Validate that an image exists in the public Artifact Registry that matches the Remotion Version. Default true
 * @param params.memoryLimit Memory limit of Cloud Run service to deploy.
 * @param params.cpuLimit CPU limit of Cloud Run service to deploy.
 * @param params.timeoutSeconds After how many seconds the Cloud Run service should be killed if it does not end itself.
 * @param params.projectID GCP Project ID to deploy the Cloud Run service to.
 * @param params.region GCP region to deploy the Cloud Run service to.
 * @returns {Promise<DeployServiceOutput>}  See documentation for detailed structure
 */
export const deployService = async ({
	performImageVersionValidation = true,
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
	minInstances,
	maxInstances,
	projectID,
	region,
}: DeployServiceInput): Promise<DeployServiceOutput> => {
	validateGcpRegion(region);
	validateProjectID(projectID);
	if (performImageVersionValidation) {
		validateImageRemotionVersion();
	}

	if (!memoryLimit) {
		memoryLimit = '2Gi';
	}

	if (!cpuLimit) {
		cpuLimit = '1.0';
	}

	if (!timeoutSeconds) {
		timeoutSeconds = DEFAULT_TIMEOUT;
	}

	if (!minInstances) {
		minInstances = DEFAULT_MIN_INSTANCES;
	}

	if (!maxInstances) {
		maxInstances = DEFAULT_MAX_INSTANCES;
	}

	const parent = `projects/${projectID}/locations/${region}`;

	const cloudRunClient = getCloudRunClient();

	const existingService = await checkIfServiceExists({
		memoryLimit,
		cpuLimit,
		timeoutSeconds,
		projectID,
		region,
	});

	const serviceName = generateServiceName({
		memoryLimit,
		cpuLimit,
		timeoutSeconds,
	});

	if (existingService) {
		return {
			fullName: `projects/${projectID}/locations/${region}/services/${serviceName}`,
			shortName: serviceName,
			uri: existingService.uri as string,
			alreadyExists: true,
		};
	}

	const request = {
		parent,
		service: {
			// service structure: https://googleapis.dev/nodejs/run/latest/google.cloud.run.v2.IService.html
			template: constructServiceTemplate({
				memoryLimit,
				cpuLimit,
				timeoutSeconds,
				minInstances,
				maxInstances,
			}),
		},
		serviceId: serviceName,
	};

	// Run request
	const [operation] = await cloudRunClient.createService(request);
	const [response] = await operation.promise();

	return {
		fullName: response.name,
		shortName: serviceName,
		uri: response.uri as string,
		alreadyExists: false,
	};
};
