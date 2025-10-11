export const getCrossOriginValue = ({
	crossOrigin,
	requestsVideoFrame,
}: {
	crossOrigin: '' | 'anonymous' | 'use-credentials' | undefined;
	requestsVideoFrame: boolean;
}) => {
	// If user specifies a value explicitly, use that
	if (crossOrigin !== undefined && crossOrigin !== null) {
		return crossOrigin;
	}

	// We need to set anonymous because otherwise we are not allowed
	// to get frames
	if (requestsVideoFrame) {
		return 'anonymous';
	}

	// If we are in preview mode, we could set
	// "anonymous" to prevent Web Audio API from
	// zeroing out the volume.
	// But this requires CORS, so we cannot default to that.

	// DONT DO THIS:
	// if (!useRemotionEnvironment().isRendering) {
	// 	return 'anonymous';
	// }

	// During rendering, we opt out of the crossOrigin value
	// because it may lead to flickering

	// https://discord.com/channels/809501355504959528/1275726814790025271/1278375651153547264
	return undefined;
};
