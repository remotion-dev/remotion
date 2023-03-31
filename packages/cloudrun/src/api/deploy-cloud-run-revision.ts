import {validateGcpRegion} from '../shared/validate-gcp-region';
import {validateProjectID} from '../shared/validate-project-id';
import {validateRemotionVersion} from '../shared/validate-remotion-version';
import {constructServiceTemplate} from './helpers/construct-service-deploy-request';
import {getCloudRunClient} from './helpers/get-cloud-run-client';
import type {IService} from './helpers/IService';

export type DeployCloudRunRevisionInput = {
	remotionVersion: string;
	existingService: IService;
	memory: string;
	cpu: string;
	projectID: string;
	region: string;
};

/**
 * @description Creates a Cloud Run service in your project that will be able to render a video in GCP.
 * @link https://remotion.dev/docs/lambda/deployfunction
 * @param options.remotionVersion Which version of Remotion to use within the Cloud Run service.
 * @param options.projectID GCP Project ID to deploy the Cloud Run service to.
 * @param options.existingService The Cloud Run service to receive a new revision.
 * @param options.region The region you want to deploy your Cloud Run service to.
 * @returns {Promise<IService>} An object that contains the `functionName` property
 */
export const deployCloudRunRevision = async (
	options: DeployCloudRunRevisionInput
): Promise<IService> => {
	validateGcpRegion(options.region);
	validateProjectID(options.projectID);
	validateRemotionVersion(options.remotionVersion);

	const cloudRunClient = getCloudRunClient();

	// Construct request
	const request = {
		service: {
			name: options.existingService.name,
			template: constructServiceTemplate({
				remotionVersion: options.remotionVersion,
				memory: options.memory,
				cpu: options.cpu,
			}),
		},
	};
	// Run request
	const [operation] = await cloudRunClient.updateService(request);
	const [response] = await operation.promise();

	return response;
};
