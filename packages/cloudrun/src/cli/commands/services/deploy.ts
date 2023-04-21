import {CliInternals} from '@remotion/cli';
import {VERSION} from 'remotion/version';
import {checkIfServiceExists} from '../../../api/check-if-service-exists';
import {allowUnauthenticatedAccess} from '../../../api/cloud-run-allow-unauthenticated-access';
import {deployService} from '../../../api/deploy-service';
import {generateServiceName} from '../../../shared/generate-service-name';
import {validateGcpRegion} from '../../../shared/validate-gcp-region';
import {validateRemotionVersion} from '../../../shared/validate-remotion-version';
import {parsedCloudrunCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import {confirmCli} from '../../helpers/confirm';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const CLOUD_RUN_DEPLOY_SUBCOMMAND = 'deploy';

export const cloudRunDeploySubcommand = async () => {
	const region = getGcpRegion();
	const projectID = process.env.REMOTION_GCP_PROJECT_ID as string;
	const remotionVersion = VERSION;
	const allowUnauthenticated =
		parsedCloudrunCli['allow-unauthenticated'] ?? false;
	const memory = parsedCloudrunCli.memory ?? '512Mi';
	const cpu = parsedCloudrunCli.cpu ?? '1.0';

	if (!CliInternals.quietFlagProvided()) {
		Log.info(
			CliInternals.chalk.gray(
				`
Validating Deployment of Cloud Run Service:

    Remotion Version = ${remotionVersion}
    Service Memory Limit = ${memory}
    Service CPU Limit = ${cpu}
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

	const existingService = await checkIfServiceExists({
		memory,
		cpu,
		projectID,
		region,
	});

	if (existingService) {
		const answer = await confirmCli({
			delMessage:
				'A Cloud Run service with the same Remotion Version, Memory, and CPU already exists. Do you want to re-deploy? (Y/n)',
			allowForceFlag: true,
		});

		if (answer === false) {
			Log.info(CliInternals.chalk.white('\nService deployment cancelled.'));
			quit(1);
		}
	}

	// if no existing service, deploy new service
	Log.info(CliInternals.chalk.white('\nDeploying Cloud Run Service...'));
	try {
		const deployResult = await deployService({
			remotionVersion,
			memory,
			cpu,
			projectID,
			region,
		});

		if (!deployResult.name) {
			Log.error('service name not returned from Cloud Run API.');
			throw new Error(JSON.stringify(deployResult));
		}

		if (!deployResult.uri) {
			Log.error('service uri not returned from Cloud Run API.');
			throw new Error(JSON.stringify(deployResult));
		}

		Log.info();

		Log.info(
			CliInternals.chalk.blueBright(
				`
🎉 Cloud Run Deployed! 🎉

    Full Service Name = ${deployResult.name}
    Cloud Run URL = ${deployResult.uri}
    Project = ${projectID}
    GCP Console URL = https://console.cloud.google.com/run/detail/${region}/${deployResult.name}/revisions
				`.trim()
			)
		);

		await allowUnauthenticatedAccessToService(
			deployResult.name,
			allowUnauthenticated
		);
	} catch (e: any) {
		Log.error(
			CliInternals.chalk.red(
				`Failed to deploy service - ${generateServiceName({
					memory,
					cpu,
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
