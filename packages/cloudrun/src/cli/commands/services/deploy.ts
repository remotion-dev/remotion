import {CliInternals} from '@remotion/cli';
import {VERSION} from 'remotion/version';
import {allowUnauthenticatedAccess} from '../../../api/cloud-run-allow-unauthenticated-access';
import {deployService} from '../../../api/deploy-service';
import {generateServiceName} from '../../../shared/generate-service-name';
import {validateGcpRegion} from '../../../shared/validate-gcp-region';
import {validateRemotionVersion} from '../../../shared/validate-remotion-version';
import {parsedCloudrunCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const CLOUD_RUN_DEPLOY_SUBCOMMAND = 'deploy';

export const cloudRunDeploySubcommand = async () => {
	const region = getGcpRegion();
	const projectID = process.env.REMOTION_GCP_PROJECT_ID as string;
	const remotionVersion = VERSION;
	const allowUnauthenticated =
		parsedCloudrunCli['allow-unauthenticated'] ?? false;
	let memoryLimit = parsedCloudrunCli.memoryLimit ?? '512Mi';
	let cpuLimit = parsedCloudrunCli.cpuLimit ?? '1.0';
	const timeoutSeconds = parsedCloudrunCli.timeoutSeconds ?? 300;

	memoryLimit = String(memoryLimit);
	cpuLimit = String(cpuLimit);

	if (!CliInternals.quietFlagProvided()) {
		Log.info(
			CliInternals.chalk.gray(
				`
Validating Deployment of Cloud Run Service:

    Remotion Version = ${remotionVersion}
    Service Memory Limit = ${memoryLimit}
    Service CPU Limit = ${cpuLimit}
    Service Timeout In Seconds = ${timeoutSeconds}
    Project Name = ${projectID}
    Region = ${region}
    Allow Unauthenticated Access = ${allowUnauthenticated}
    `.trim()
			)
		);
	}

	Log.info();

	validateGcpRegion(region);
	validateRemotionVersion(remotionVersion);

	if (projectID === undefined) {
		Log.error(`REMOTION_GCP_PROJECT_ID not found in the .env file.`);
		quit(0);
	}

	// if no existing service, deploy new service
	Log.info(CliInternals.chalk.white('\nDeploying Cloud Run Service...'));
	try {
		const deployResult = await deployService({
			remotionVersion,
			memoryLimit,
			cpuLimit,
			timeoutSeconds,
			projectID,
			region,
		});

		if (!deployResult.fullName) {
			Log.error('full service name not returned from Cloud Run API.');
			throw new Error(JSON.stringify(deployResult));
		}

		if (!deployResult.shortName) {
			Log.error('short service name not returned from Cloud Run API.');
			throw new Error(JSON.stringify(deployResult));
		}

		if (!deployResult.alreadyExists && !deployResult.uri) {
			Log.error('service uri not returned from Cloud Run API.');
		}

		if (deployResult.alreadyExists) {
			Log.info();

			Log.info(
				CliInternals.chalk.blueBright(
					`
	Service Already Deployed! Check GCP Console for Cloud Run URL.
	
    Full Service Name = ${deployResult.fullName}
    Project = ${projectID}
    GCP Console URL = https://console.cloud.google.com/run/detail/${region}/${deployResult.shortName}/revisions
					`.trim()
				)
			);
		} else {
			Log.info();

			Log.info(
				CliInternals.chalk.blueBright(
					`
	🎉 Cloud Run Deployed! 🎉
	
	Full Service Name = ${deployResult.fullName}
    Cloud Run URL = ${deployResult.uri}
    Project = ${projectID}
    GCP Console URL = https://console.cloud.google.com/run/detail/${region}/${deployResult.shortName}/revisions
					`.trim()
				)
			);
		}

		await allowUnauthenticatedAccessToService(
			deployResult.fullName,
			allowUnauthenticated
		);
	} catch (e: any) {
		Log.error(
			CliInternals.chalk.red(
				`Failed to deploy service - ${generateServiceName({
					memoryLimit,
					cpuLimit,
					timeoutSeconds,
				})}.`
			)
		);
		throw e;
	}
};

if (CliInternals.quietFlagProvided()) {
	// Log.info(functionName);
}

async function allowUnauthenticatedAccessToService(
	serviceName: string,
	allowUnauthenticated: boolean
) {
	if (allowUnauthenticated) {
		try {
			Log.info(
				CliInternals.chalk.white(
					'\nAllowing unauthenticated access to the Cloud Run service...'
				)
			);
			await allowUnauthenticatedAccess(serviceName, allowUnauthenticated);

			Log.info();

			Log.info(
				CliInternals.chalk.blueBright(
					`    ✅ Unauthenticated access granted on ${serviceName}`
				)
			);
		} catch (e) {
			Log.error(
				CliInternals.chalk.red(
					`    Failed to allow unauthenticated access to the Cloud Run service.`
				)
			);
			throw e;
		}
	} else {
		try {
			Log.info();

			Log.info(
				CliInternals.chalk.white(
					'Ensuring only authenticated access to the Cloud Run service...'
				)
			);
			await allowUnauthenticatedAccess(serviceName, allowUnauthenticated);

			Log.info();

			Log.info(
				CliInternals.chalk.blueBright(
					`    🔒 Only authenticated access granted on ${serviceName}`
				)
			);
		} catch (e) {
			Log.error(
				CliInternals.chalk.red(
					`    Failed to allow unauthenticated access to the Cloud Run service.`
				)
			);
			throw e;
		}
	}
}
