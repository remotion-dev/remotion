import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {VERSION} from 'remotion/version';
import {checkIfServiceExists} from '../../../api/check-if-service-exists';
import {allowUnauthenticatedAccess} from '../../../api/cloud-run-allow-unauthenticated-access';
import {deployCloudRunRevision} from '../../../api/deploy-cloud-run-revision';
import {deployNewCloudRun} from '../../../api/deploy-new-cloud-run';
import {validateGcpRegion} from '../../../shared/validate-gcp-region';
import {validateOverwrite} from '../../../shared/validate-overwrite';
import {validateProjectID} from '../../../shared/validate-project-id';
import {validateRemotionVersion} from '../../../shared/validate-remotion-version';
import {validateServiceName} from '../../../shared/validate-service-name';
import {parsedGcpCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import {confirmCli} from '../../helpers/confirm';
import {quit} from '../../helpers/quit';

export const CLOUD_RUN_DEPLOY_SUBCOMMAND = 'deploy';

export const cloudRunDeploySubcommand = async () => {
	const region = getGcpRegion();
	const serviceName = parsedGcpCli['service-name'];
	const projectID = parsedGcpCli['project-id'];
	const remotionVersion = parsedGcpCli['remotion-version'] ?? VERSION;
	const allowUnauthenticated = parsedGcpCli['allow-unauthenticated'] ?? false;
	const overwriteService = parsedGcpCli['overwrite-service'] ?? false;

	validateGcpRegion(region);
	validateServiceName(serviceName);
	validateProjectID(projectID);
	validateRemotionVersion(remotionVersion);
	validateOverwrite(overwriteService);
	if (!CliInternals.quietFlagProvided()) {
		Log.info(
			CliInternals.chalk.gray(
				`
Remotion Version = ${remotionVersion}
Service Name = ${serviceName}
Project Name = ${projectID}
Region = ${region}
Allow Unauthenticated Access = ${allowUnauthenticated}
Overwrite exsting service = ${overwriteService}
				`.trim()
			)
		);
	}

	const existingService = await checkIfServiceExists({
		serviceNameToCheck: serviceName,
		projectID,
		region,
	});

	if (existingService) {
		const shouldDeployNewRevision =
			overwriteService ||
			(await confirmCli({
				delMessage: `Existing service found in ${projectID} project. Deploy new revision? (Y/n)`,
				allowForceFlag: true,
			}));

		if (shouldDeployNewRevision) {
			Log.info(CliInternals.chalk.white('Deploying Cloud Run Revision...'));
			const deployRevisionResult = await deployCloudRunRevision({
				remotionVersion,
				existingService,
				projectID,
				region,
			});
			// TODO: should somehow check if the new revision was identical to the previous one, and therefore not actually revised

			if (!deployRevisionResult.name || !deployRevisionResult.uri) {
				throw new Error(
					`Failed to deploy revision. Invalid response from Cloud Run 👉 ${deployRevisionResult}`
				);
			}

			Log.info(
				CliInternals.chalk.blueBright(
					`
Cloud Run Revision Deployed! 🎉
Service Name = ${deployRevisionResult.name}
Cloud Run URL = ${deployRevisionResult.uri}
Project = ${projectID}
GCP Console URL = https://console.cloud.google.com/run/detail/${region}/${serviceName}/revisions
				`.trim()
				)
			);

			if (allowUnauthenticated) {
				await allowUnauthenticatedAccessToService(deployRevisionResult.name);
			}
		} else {
			Log.info(CliInternals.chalk.gray('deploy cancelled'));
			quit(1); // TODO: Check with Jonny what to pass to quit
		}
	} else {
		// if no existing service, deploy new service
		Log.info(CliInternals.chalk.white('\nDeploying Cloud Run Service...'));
		try {
			const deployResult = await deployNewCloudRun({
				remotionVersion,
				serviceName,
				projectID,
				region,
				overwriteService,
			});

			if (!deployResult.name) {
				Log.error('service name not returned from Cloud Run API.');
				throw new Error(JSON.stringify(deployResult));
			}

			if (!deployResult.uri) {
				Log.error('service uri not returned from Cloud Run API.');
				throw new Error(JSON.stringify(deployResult));
			}

			Log.info(
				CliInternals.chalk.blueBright(
					`
Cloud Run Deployed! 🎉
Full Service Name = ${deployResult.name}
Cloud Run URL = ${deployResult.uri}
Project = ${projectID}
GCP Console URL = https://console.cloud.google.com/run/detail/${region}/${serviceName}/revisions
				`.trim()
				)
			);

			if (allowUnauthenticated) {
				await allowUnauthenticatedAccessToService(deployResult.name);
			}
		} catch (e: any) {
			if (e.code === 6) {
				Log.error(
					CliInternals.chalk.red(
						`Failed to deploy service - ${serviceName} already exists in ${parent}.`
					)
				);
			} else {
				throw e;
			}
		}
	}

	if (CliInternals.quietFlagProvided()) {
		// Log.info(functionName);
	}
};

async function allowUnauthenticatedAccessToService(serviceName: string) {
	try {
		Log.info(
			CliInternals.chalk.white(
				'\nAllowing unauthenticated access to the Cloud Run service...'
			)
		);
		await allowUnauthenticatedAccess(serviceName);
		Log.info(
			CliInternals.chalk.blueBright(
				`Unauthenticated access granted on ${serviceName}`
			)
		);
	} catch (e) {
		Log.error(
			CliInternals.chalk.red(
				`Failed to allow unauthenticated access to the Cloud Run service.`
			)
		);
		throw e;
	}
}
