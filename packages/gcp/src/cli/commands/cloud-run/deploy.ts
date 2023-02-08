import { CliInternals } from '@remotion/cli';
import { Log } from '@remotion/cli/dist/log';
import { VERSION } from 'remotion/version';
import { deployCloudRun } from '../../../api/deploy-cloud-run';
import { validateServiceName } from '../../../shared/validate-service-name';
import { validateProjectID } from '../../../shared/validate-project-id';
import { validateRemotionVersion } from '../../../shared/validate-remotion-version';
import { parsedGcpCli } from '../../args';
import { getGcpRegion } from '../../get-gcp-region';

export const CLOUD_RUN_DEPLOY_SUBCOMMAND = 'deploy';

export const cloudRunDeploySubcommand = async () => {
	const region = getGcpRegion();
	const serviceName = parsedGcpCli['service-name'];
	const projectID = parsedGcpCli['project-id'];
	const remotionVersion = parsedGcpCli['remotion-version'] ?? VERSION;
	const allowUnauthenticated = parsedGcpCli['allow-unauthenticated'] ?? true;

	validateServiceName(serviceName);
	validateProjectID(projectID);
	validateRemotionVersion(remotionVersion);
	if (!CliInternals.quietFlagProvided()) {
		Log.info(
			CliInternals.chalk.gray(
				`
Remotion Version = ${remotionVersion}
Service Name = ${serviceName}
Project Name = ${projectID}
Region = ${region}
Allow Unauthenticated Access = ${allowUnauthenticated}
				`.trim()
			)
		);
	}

	const output = CliInternals.createOverwriteableCliOutput(
		CliInternals.quietFlagProvided()
	);
	output.update('Deploying Cloud Run...');
	await deployCloudRun({
		remotionVersion,
		serviceName,
		projectID,
		region,
		allowUnauthenticated
	});
	if (CliInternals.quietFlagProvided()) {
		// Log.info(functionName);
	}

	// if (alreadyExisted) {
	// 	output.update(`Already exists as ${functionName}\n`);
	// } else {
	// 	output.update(`Deployed as ${functionName}\n`);
	// }
};
