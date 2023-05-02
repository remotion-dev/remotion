export const constructServiceTemplate = ({
	remotionVersion,
	memoryLimit,
	cpuLimit,
}: {
	remotionVersion: string;
	memoryLimit: string;
	cpuLimit: string;
}) => {
	return {
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
