import type {
	CloudProvider,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {ServerlessRoutines, VERSION} from '@remotion/serverless-client';
import type {InsideFunctionSpecifics} from '../provider-implementation';

export const checkVersionMismatch = <Provider extends CloudProvider>({
	params,
	insideFunctionSpecifics,
	apiName,
}: {
	params: ServerlessPayload<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
	apiName: string;
}) => {
	if (params.type === ServerlessRoutines.info) {
		return;
	}

	if (params.type === ServerlessRoutines.renderer) {
		return;
	}

	if (params.type === ServerlessRoutines.launch) {
		return;
	}

	if (params.version !== VERSION) {
		if (!params.version) {
			throw new Error(
				`Version mismatch: When calling ${apiName}, you called the function ${insideFunctionSpecifics.getCurrentFunctionName()} which has the version ${VERSION} but the @remotion/lambda package is an older version. Deploy a new function and use it to call ${apiName}. See: https://www.remotion.dev/docs/lambda/upgrading`,
			);
		}

		throw new Error(
			`Version mismatch: When calling ${apiName}, you passed ${insideFunctionSpecifics.getCurrentFunctionName()} as the function, which has the version ${VERSION}, but the @remotion/lambda package you used to invoke the function has version ${params.version}. Deploy a new function and use it to call getRenderProgress(). See: https://www.remotion.dev/docs/lambda/upgrading`,
		);
	}
};
