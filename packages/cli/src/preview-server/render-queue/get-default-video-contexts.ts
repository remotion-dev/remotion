import type {AudioCodec, Codec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderType} from '../../editor/components/RenderModal/RenderModalAdvanced';

export const getDefaultCodecs = ({
	defaultConfigurationVideoCodec,
	compositionDefaultVideoCodec,
	renderType,
	defaultConfigurationAudioCodec,
}: {
	defaultConfigurationVideoCodec: Codec | null;
	defaultConfigurationAudioCodec: AudioCodec | null;
	compositionDefaultVideoCodec: Codec | null;
	renderType: RenderType;
}): {
	initialAudioCodec: AudioCodec;
	initialVideoCodec: Codec;
	initialRenderType: RenderType;
	initialVideoCodecForAudioTab: Codec;
	initialVideoCodecForVideoTab: Codec;
} => {
	const userPreferredVideoCodec =
		compositionDefaultVideoCodec ?? defaultConfigurationVideoCodec ?? 'h264';

	const isVideoCodecAnAudioCodec = BrowserSafeApis.isAudioCodec(
		userPreferredVideoCodec,
	);

	if (isVideoCodecAnAudioCodec) {
		return {
			initialAudioCodec: userPreferredVideoCodec as AudioCodec,
			initialRenderType: 'audio',
			initialVideoCodec: userPreferredVideoCodec as Codec,
			initialVideoCodecForAudioTab: userPreferredVideoCodec,
			initialVideoCodecForVideoTab: BrowserSafeApis.isAudioCodec(
				defaultConfigurationVideoCodec,
			)
				? 'h264'
				: (defaultConfigurationVideoCodec as Codec),
		};
	}

	const suitableAudioCodecForVideoCodec = BrowserSafeApis.defaultAudioCodecs[
		userPreferredVideoCodec
	].compressed as AudioCodec;

	return {
		initialAudioCodec:
			defaultConfigurationAudioCodec ?? suitableAudioCodecForVideoCodec,
		initialVideoCodec: userPreferredVideoCodec,
		initialRenderType: renderType,
		initialVideoCodecForAudioTab: userPreferredVideoCodec,
		initialVideoCodecForVideoTab: userPreferredVideoCodec,
	};
};
