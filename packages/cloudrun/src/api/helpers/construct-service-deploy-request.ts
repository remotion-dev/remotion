import {VERSION} from 'remotion/version';

export const constructServiceTemplate = ({
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
}: {
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
				image: `us-docker.pkg.dev/remotion-dev/cloud-run/render:${VERSION}`,
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
