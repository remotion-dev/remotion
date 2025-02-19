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

	return assetsInfo.assets.flat(1).length > 0 ? 'yes' : 'no';
};
