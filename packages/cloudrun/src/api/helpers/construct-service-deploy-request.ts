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
}: {
	memoryLimit: string;
	cpuLimit: string;
	timeoutSeconds: number;
	minInstances: number;
	maxInstances: number;
}) => {
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
				image: `us-docker.pkg.dev/remotion-dev/cloud-run/render:${VERSION}`,
				resources: {
					limits: {
						memory: memoryLimit,
						cpu: cpuLimit,
					},
				},
			},
		],
		maxInstanceRequestConcurrency: 1,
		executionEnvironment: ExecutionEnvironment.EXECUTION_ENVIRONMENT_GEN1,
	};
};
