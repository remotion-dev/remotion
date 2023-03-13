import {validateGcpRegion} from '../shared/validate-gcp-region';
import {validateProjectID} from '../shared/validate-project-id';
import {validateRemotionVersion} from '../shared/validate-remotion-version';
import {validateServiceName} from '../shared/validate-service-name';
import {constructServiceTemplate} from './helpers/construct-service-deploy-request';
import {getCloudRunClient} from './helpers/get-cloud-run-client';
import type {IService} from './helpers/IService';

export type DeployCloudRunInput = {
	remotionVersion: string;
	serviceName: string;
	memory: string;
	cpu: string;
	projectID: string;
	region: string;
	overwriteService: boolean;
};

/**
 * @description Creates a Cloud Run service in your project that will be able to render a video in GCP.
 * @link https://remotion.dev/docs/lambda/deployfunction
 * @param options.remotionVersion Which version of Remotion to use within the Cloud Run service.
 * @param options.projectID GCP Project ID to deploy the Cloud Run service to.
 * @param options.serviceName The name of the Cloud Run service.
 * @param options.region The region you want to deploy your Cloud Run service to.
 * @returns {Promise<IService>} An object that contains the `functionName` property
 */
export const deployNewCloudRun = async (
	options: DeployCloudRunInput
): Promise<IService> => {
	// ToDo: This needs to allow for defaults for use of the node API without CLI
	validateGcpRegion(options.region);
	validateServiceName(options.serviceName);
	validateProjectID(options.projectID);
	validateRemotionVersion(options.remotionVersion);

	const parent = `projects/${options.projectID}/locations/${options.region}`;

	const cloudRunClient = getCloudRunClient();

	const request = {
		parent,
		service: {
			// service structure: https://googleapis.dev/nodejs/run/latest/google.cloud.run.v2.IService.html
			template: constructServiceTemplate({
				remotionVersion: options.remotionVersion,
				memory: options.memory,
				cpu: options.cpu,
			}),
		},
		serviceId: options.serviceName,
	};

	// Run request
	const [operation] = await cloudRunClient.createService(request);
	const [response] = await operation.promise();

	return response;
};
