import {NoReactInternals} from 'remotion/no-react';
import type {RenderAssetInfo} from './assets/download-map';
import type {Codec} from './codec';
import {codecSupportsMedia} from './codec-supports-media';

export const getShouldRenderAudio = ({
	codec,
	assetsInfo,
	enforceAudioTrack,
	muted,
}: {
	codec: Codec;
	assetsInfo: RenderAssetInfo | null;
	enforceAudioTrack: boolean;
	muted: boolean;
}): 'yes' | 'maybe' | 'no' => {
	if (muted) {
		return 'no';
	}

	if (!codecSupportsMedia(codec).audio) {
		return 'no';
	}

	if (enforceAudioTrack) {
		return 'yes';
	}

	if (assetsInfo === null) {
		return 'maybe';
	}

	if (NoReactInternals.ENABLE_V5_BREAKING_CHANGES) {
		if (!codecSupportsMedia(codec).video) {
			return 'yes';
		}

		return assetsInfo.assets.some(
			(frame) =>
				frame.audioAndVideoAssets.length > 0 ||
				frame.inlineAudioAssets.length > 0,
		)
			? 'yes'
			: 'no';
	}

	return assetsInfo.assets.flat(1).length > 0 ? 'yes' : 'no';
};
