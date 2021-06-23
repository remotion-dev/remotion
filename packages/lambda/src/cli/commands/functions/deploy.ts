import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {deployLambda} from '../../../api/deploy-lambda';
import {ensureLambdaBinaries} from '../../../api/ensure-lambda-binaries';
import {
	CURRENT_VERSION,
	DEFAULT_MEMORY_SIZE,
	DEFAULT_TIMEOUT,
} from '../../../shared/constants';
import {validateMemorySize} from '../../../shared/validate-memory-size';
import {validateTimeout} from '../../../shared/validate-timeout';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';

export const FUNCTIONS_DEPLOY_SUBCOMMAND = 'deploy';

export const functionsDeploySubcommand = async () => {
	const region = getAwsRegion();
	const timeoutInSeconds = parsedLambdaCli.timeout ?? DEFAULT_TIMEOUT;
	const memorySize = parsedLambdaCli.memory ?? DEFAULT_MEMORY_SIZE;
	validateMemorySize(memorySize);
	validateTimeout(timeoutInSeconds);
	Log.info(
		CliInternals.chalk.gray(
			`Region = ${region}, Memory = ${memorySize}MB, Timeout = ${timeoutInSeconds}sec, Version = ${CURRENT_VERSION}`
		)
	);
	const output = CliInternals.createOverwriteableCliOutput();
	output.update('Ensuring Lambda binaries...');
	// TODO: Output can be more finegrained
	const {layerArn} = await ensureLambdaBinaries(getAwsRegion());
	output.update('Bundling lambda and deploying...');
	const {functionName} = await deployLambda({
		region,
		timeoutInSeconds,
		layerArn,
		memorySize,
	});
	output.update(`Deployed to ${functionName}\n`);
};
