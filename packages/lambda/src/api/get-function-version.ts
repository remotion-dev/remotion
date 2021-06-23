import {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import {
	COMMAND_NOT_FOUND,
	LambdaRoutines,
	LambdaVersions,
} from '../shared/constants';

export const getFunctionVersion = async ({
	functionName,
	region,
}: {
	functionName: string;
	region: AwsRegion;
}): Promise<LambdaVersions> => {
	try {
		const result = await callLambda({
			functionName,
			payload: {
				type: LambdaRoutines.info,
			},
			region,
			type: LambdaRoutines.info,
		});
		return result.version;
	} catch (err) {
		// Prerelease versions had no info command
		if (err.message.includes(COMMAND_NOT_FOUND)) {
			return 'n/a';
		}

		throw err;
	}
};
