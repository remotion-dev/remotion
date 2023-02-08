import { validateGcpRegion } from '../shared/validate-gcp-region';
import { validateServiceName } from '../shared/validate-service-name';
import { validateProjectID } from '../shared/validate-project-id';
import { exec } from 'child_process';

export type DeployCloudRunInput = {
	remotionVersion: string;
	serviceName: string;
	projectID: string;
	region: string;
	allowUnauthenticated: boolean;
};

// TODO - add some meaningful output
// export type DeployCloudRunOutput = {
// 	functionName: string;
// 	alreadyExisted: boolean;
// };

/**
 * @description Creates a Cloud Run service in your project that will be able to render a video in GCP.
 * @link https://remotion.dev/docs/lambda/deployfunction
 * @param options.remotionVersion Which version of Remotion to use within the Cloud Run service.
 * @param options.projectID GCP Project ID to deploy the Cloud Run service to.
 * @param options.serviceName The name of the Cloud Run service.
 * @param options.region The region you want to deploy your Cloud Run service to.
 * @param options.allowUnauthenticated Defaults true. If true, allow anyone with the Cloud Run url to trigger the service. Alternatively, manage access via Cloud IAM in GCP.
 * @returns {Promise<DeployCloudRunOutput>} An object that contains the `functionName` property
 */
export const deployCloudRun = async (
	options: DeployCloudRunInput
): Promise<undefined> => {
	validateGcpRegion(options.region);
	validateServiceName(options.serviceName);
	validateProjectID(options.projectID);


exec(`gcloud run deploy ${options.serviceName} --image=us-docker.pkg.dev/remotion-dev/cloud-run/render:${options.remotionVersion} --project=${options.projectID} --region=${options.region} ${options.allowUnauthenticated ? '--allow-unauthenticated' : '--no-allow-unauthenticated'}`,
	(error, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);
		if (error !== null) {
			console.log(`exec error: ${error}`);
		}
	});

	// TODO - return cloud run serve url
	return ;
};
