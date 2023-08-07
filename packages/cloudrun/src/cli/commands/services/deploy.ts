import {CliInternals} from '@remotion/cli';
import {VERSION} from 'remotion/version';
import {displayServiceInfo, LEFT_COL} from '.';
import {deployService} from '../../../api/deploy-service';
import {
	DEFAULT_MAX_INSTANCES,
	DEFAULT_MIN_INSTANCES,
	DEFAULT_TIMEOUT,
} from '../../../shared/constants';
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
	const minInstances = String(
		parsedCloudrunCli.minInstances ?? DEFAULT_MIN_INSTANCES
	);
	const maxInstances = String(
		parsedCloudrunCli.maxInstances ?? DEFAULT_MAX_INSTANCES
	);
	const timeoutSeconds = parsedCloudrunCli.timeoutSeconds ?? DEFAULT_TIMEOUT;

	if (!CliInternals.quietFlagProvided()) {
		Log.info(
			CliInternals.chalk.gray(
				`
Validating Deployment of Cloud Run Service:

${[
	'Remotion Version: '.padEnd(LEFT_COL, ' ') + ' ' + VERSION,
	'Memory Limit: '.padEnd(LEFT_COL, ' ') + ' ' + memoryLimit,
	'CPU Limit: '.padEnd(LEFT_COL, ' ') + ' ' + cpuLimit,
	'Minimum Instances: '.padEnd(LEFT_COL, ' ') + ' ' + minInstances,
	'Maximum Instances: '.padEnd(LEFT_COL, ' ') + ' ' + maxInstances,
	'CPU Limit: '.padEnd(LEFT_COL, ' ') + ' ' + cpuLimit,
	'Timeout: '.padEnd(LEFT_COL, ' ') + ' ' + timeoutSeconds,
	'Project Name: '.padEnd(LEFT_COL, ' ') + ' ' + projectID,
	'Region: '.padEnd(LEFT_COL, ' ') + ' ' + region,
].join('\n')}
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

		const consoleUrl = `https://console.cloud.google.com/run/detail/${region}/${deployResult.shortName}/logs`;

		if (deployResult.alreadyExists) {
			Log.info();

			if (CliInternals.quietFlagProvided()) {
				CliInternals.Log.info(deployResult.shortName);
			} else {
				Log.info(
					CliInternals.chalk.blueBright(
						`
Service already exists, skipping deployment;
		
${displayServiceInfo({
	serviceName: deployResult.shortName,
	timeoutInSeconds: timeoutSeconds,
	memoryLimit,
	cpuLimit,
	remotionVersion: VERSION,
	uri: deployResult.uri,
	region,
	consoleUrl,
})}
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
Cloud Run Deployed!

${displayServiceInfo({
	serviceName: deployResult.shortName,
	timeoutInSeconds: timeoutSeconds,
	memoryLimit,
	cpuLimit,
	remotionVersion: VERSION,
	uri: deployResult.uri,
	region,
	consoleUrl,
})}
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
