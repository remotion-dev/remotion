import {CliInternals} from '@remotion/cli';
import {VERSION} from 'remotion/version';
import {deployService} from '../../../api/deploy-service';
import {generateServiceName} from '../../../shared/generate-service-name';
import {validateGcpRegion} from '../../../shared/validate-gcp-region';
import {validateImageRemotionVersion} from '../../../shared/validate-image-remotion-version';
import {parsedCloudrunCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const CLOUD_RUN_DEPLOY_SUBCOMMAND = 'deploy';

export const cloudRunDeploySubcommand = async () => {
	const region = getGcpRegion();
	const projectID = process.env.REMOTION_GCP_PROJECT_ID as string;
	const memoryLimit = String(parsedCloudrunCli.memoryLimit ?? '2Gi');
	const cpuLimit = String(parsedCloudrunCli.cpuLimit ?? '1.0');
	const timeoutSeconds = parsedCloudrunCli.timeoutSeconds ?? 300;

	if (!CliInternals.quietFlagProvided()) {
		Log.info(
			CliInternals.chalk.gray(
				`
Validating Deployment of Cloud Run Service:

    Remotion Version = ${VERSION}
    Service Memory Limit = ${memoryLimit}
    Service CPU Limit = ${cpuLimit}
    Service Timeout In Seconds = ${timeoutSeconds}
    Project Name = ${projectID}
    Region = ${region}
    `.trim()
			)
		);

		Log.info();
	}

	validateGcpRegion(region);
	await validateImageRemotionVersion();

	if (projectID === undefined) {
		Log.error(`REMOTION_GCP_PROJECT_ID not found in the .env file.`);
		quit(0);
	}

	// if no existing service, deploy new service

	if (!CliInternals.quietFlagProvided()) {
		Log.info(CliInternals.chalk.white('\nDeploying Cloud Run Service...'));
	}

	try {
		const deployResult = await deployService({
			performImageVersionValidation: false, // this is already performed above
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

			if (CliInternals.quietFlagProvided()) {
				CliInternals.Log.info(deployResult.shortName);
			} else {
				Log.info(
					CliInternals.chalk.blueBright(
						`
Service Already Deployed! Check GCP Console for Cloud Run URL.
		
    Full Service Name = ${deployResult.fullName}
    Project = ${projectID}
    GCP Console URL = https://console.cloud.google.com/run/detail/${region}/${deployResult.shortName}/logs
						`.trim()
					)
				);
			}
		} else {
			Log.info();

			if (CliInternals.quietFlagProvided()) {
				CliInternals.Log.info(deployResult.shortName);
			} else {
				Log.info(
					CliInternals.chalk.blueBright(
						`
🎉 Cloud Run Deployed! 🎉
		
    Full Service Name = ${deployResult.fullName}
    Cloud Run URL = ${deployResult.uri}
    Project = ${projectID}
    GCP Console URL = https://console.cloud.google.com/run/detail/${region}/${deployResult.shortName}/logs
						`.trim()
					)
				);
			}
		}
	} catch (e) {
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
