import type {google} from '@google-cloud/run/build/protos/protos';
import {VERSION} from 'remotion/version';

// taken from within the @google-cloud/run package, can't import it directly
enum ExecutionEnvironment {
	EXECUTION_ENVIRONMENT_UNSPECIFIED = 0,
	EXECUTION_ENVIRONMENT_GEN1 = 1,
	EXECUTION_ENVIRONMENT_GEN2 = 2,
}

export const constructServiceTemplate = ({
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
	minInstances,
	maxInstances,
	onlyAllocateCpuDuringRequestProcessing,
}: {
	memoryLimit: string;
	cpuLimit: string;
	timeoutSeconds: number;
	minInstances: number;
	maxInstances: number;
	onlyAllocateCpuDuringRequestProcessing: boolean;
}): google.cloud.run.v2.IRevisionTemplate => {
	return {
		scaling: {
			minInstanceCount: minInstances,
			maxInstanceCount: maxInstances,
		},
		timeout: {
			seconds: timeoutSeconds,
		},
		containers: [
			{
				image: `us-docker.pkg.dev/remotion-dev/${
					process.env.ARTIFACT_REGISTRY_ENV ?? 'production'
				}/render:${VERSION}`,
				resources: {
					limits: {
						memory: memoryLimit,
						cpu: cpuLimit,
					},
					cpuIdle: onlyAllocateCpuDuringRequestProcessing,
				},
			},
		],
		maxInstanceRequestConcurrency: 1,
		executionEnvironment: ExecutionEnvironment.EXECUTION_ENVIRONMENT_GEN1,
		serviceAccount: process.env.REMOTION_GCP_CLIENT_EMAIL,
	};
};
