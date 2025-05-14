import {getRemotionEnvironment} from './get-remotion-environment';

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

	// If we are in preview mode, we need to set anonymous
	// because we use Web Audio API and otherwise it would
	// zero out
	// See issue: https://github.com/remotion-dev/remotion/issues/5274
	// Second reason: In Studio, window.crossOriginIsolated is set,
	// and you cannot play media from CORS at all.

	if (!getRemotionEnvironment().isRendering) {
		return 'anonymous';
	}

	// During rendering, we opt out of the crossOrigin value
	// because it may lead to flickering

	// https://discord.com/channels/809501355504959528/1275726814790025271/1278375651153547264
	return undefined;
};
