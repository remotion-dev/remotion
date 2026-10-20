import type {
	CloudProvider,
	ProviderSpecifics,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {ServerlessRoutines, VERSION} from '@remotion/serverless-client';
import type {InsideFunctionSpecifics} from '../provider-implementation';

export const checkVersionMismatch = <Provider extends CloudProvider>({
	params,
	providerSpecifics,
	insideFunctionSpecifics,
	apiName,
}: {
	params: ServerlessPayload<Provider>;
	providerSpecifics: ProviderSpecifics<Provider>;
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
		const {clientPackage} = providerSpecifics.names;
		if (!params.version) {
			throw new Error(
				`Version mismatch: When calling ${apiName}(), you called the function ${insideFunctionSpecifics.getCurrentFunctionName()} which has the version ${VERSION} but the ${clientPackage} package sent an incompatible payload: ${JSON.stringify(
					params,
				)}. Expected it to contain {version: ${VERSION}}`,
			);
		}

		throw new Error(
			`Version mismatch: When calling ${apiName}(), you passed ${insideFunctionSpecifics.getCurrentFunctionName()} as the function, which has the version ${VERSION}, but the ${clientPackage} package you used to invoke the function has version ${params.version}. Deploy a new function and use it to call ${apiName}(). See: ${providerSpecifics.getDocsUrl('upgrading')}`,
		);
	}
};
