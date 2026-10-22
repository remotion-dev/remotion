import {
	ServerlessRoutines,
	type ServerlessPayload,
} from '@remotion/lambda-client';
import {VERSION} from 'remotion/version';
import {getCurrentFunctionName} from '../helpers/get-current-function-name';

export const checkVersionMismatch = ({
	params,
	apiName,
}: {
	params: ServerlessPayload;
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
				`Version mismatch: When calling ${apiName}, you called the function ${getCurrentFunctionName()} which has the version ${VERSION} but the @remotion/lambda package sent an incompatible payload: ${JSON.stringify(
					params,
				)}. Expected it to contain {version: ${VERSION}}`,
			);
		}

		throw new Error(
			`Version mismatch: When calling ${apiName}, you passed ${getCurrentFunctionName()} as the function, which has the version ${VERSION}, but the @remotion/lambda package you used to invoke the function has version ${params.version}. Deploy a new function and use it to call getRenderProgress(). See: https://www.remotion.dev/docs/lambda/upgrading`,
		);
	}
};
