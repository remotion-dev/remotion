export const constructServiceTemplate = ({
	remotionVersion,
	memory,
	cpu,
}: {
	remotionVersion: string;
	memory: string;
	cpu: string;
}) => {
	return {
		containers: [
			{
				image: `us-docker.pkg.dev/remotion-dev/cloud-run/render:${remotionVersion}`,
				resources: {
					limits: {
						memory,
						cpu,
					},
				},
			},
		],
	};
};
