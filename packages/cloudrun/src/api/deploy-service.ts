import type {google} from '@google-cloud/run/build/protos/protos';
import type {LogLevel} from '@remotion/renderer';
import {wrapWithErrorHandling} from '@remotion/renderer/error-handling';
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

type InternalDeployServiceInput = {
	performImageVersionValidation: boolean;
	memoryLimit: string;
	cpuLimit: string;
	timeoutSeconds: number;
	minInstances: number;
	maxInstances: number;
	projectID: string;
	region: string;
	logLevel: LogLevel;
	indent: boolean;
	onlyAllocateCpuDuringRequestProcessing: boolean;
};
export type DeployServiceInput = {
	performImageVersionValidation?: boolean;
	memoryLimit?: string;
	cpuLimit?: string;
	timeoutSeconds?: number;
	minInstances?: number;
	maxInstances?: number;
	logLevel?: LogLevel;
	projectID: string;
	region: string;
	onlyAllocateCpuDuringRequestProcessing?: boolean;
};

export type DeployServiceOutput = {
	fullName: string | null | undefined;
	shortName: string | null | undefined;
	uri: string;
	alreadyExists: boolean;
};

const deployServiceRaw = async ({
	performImageVersionValidation = true,
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
	minInstances,
	maxInstances,
	projectID,
	region,
	logLevel,
	onlyAllocateCpuDuringRequestProcessing,
}: InternalDeployServiceInput): Promise<DeployServiceOutput> => {
	validateGcpRegion(region);
	validateProjectID(projectID);
	if (performImageVersionValidation) {
		validateImageRemotionVersion();
	}

	const parent = `projects/${projectID}/locations/${region}`;

	const cloudRunClient = getCloudRunClient();

	const existingService = await checkIfServiceExists({
		memoryLimit,
		cpuLimit,
		timeoutSeconds,
		projectID,
		region,
		logLevel,
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

	const request: google.cloud.run.v2.ICreateServiceRequest = {
		parent,
		service: {
			template: constructServiceTemplate({
				memoryLimit,
				cpuLimit,
				timeoutSeconds,
				minInstances,
				maxInstances,
				onlyAllocateCpuDuringRequestProcessing,
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

export const internalDeployService = wrapWithErrorHandling(deployServiceRaw);

/*
 * @description Creates a Cloud Run service in your project that will be able to render a video in GCP.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/deployservice)
 */

export const deployService = ({
	performImageVersionValidation = true,
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
	minInstances,
	maxInstances,
	projectID,
	region,
	logLevel,
	onlyAllocateCpuDuringRequestProcessing,
}: DeployServiceInput): Promise<DeployServiceOutput> => {
	return internalDeployService({
		performImageVersionValidation,
		memoryLimit: memoryLimit ?? '2Gi',
		cpuLimit: cpuLimit ?? '1.0',
		timeoutSeconds: timeoutSeconds ?? DEFAULT_TIMEOUT,
		minInstances: minInstances ?? DEFAULT_MIN_INSTANCES,
		maxInstances: maxInstances ?? DEFAULT_MAX_INSTANCES,
		projectID,
		region,
		logLevel: logLevel ?? 'info',
		indent: false,
		onlyAllocateCpuDuringRequestProcessing:
			onlyAllocateCpuDuringRequestProcessing ?? false,
	});
};
