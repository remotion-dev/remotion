export const constructServiceTemplate = ({
	remotionVersion,
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
}: {
	remotionVersion: string;
	memoryLimit: string;
	cpuLimit: string;
	timeoutSeconds: number;
}) => {
	return {
		timeout: {
			seconds: timeoutSeconds,
		},
		containers: [
			{
				image: `us-docker.pkg.dev/remotion-dev/cloud-run/render:${remotionVersion}`,
				resources: {
					limits: {
						memory: memoryLimit,
						cpu: cpuLimit,
					},
				},
			},
		],
	};
};
