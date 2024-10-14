import type {AudioCodec, Codec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactAPIs} from '@remotion/renderer/pure';
import type {RenderType} from './RenderModalAdvanced';

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
	const userPreferredVideoCodecForAudioTab: Codec =
		userPreferredVideoCodec === 'aac'
			? 'aac'
			: userPreferredVideoCodec === 'mp3'
				? 'mp3'
				: userPreferredVideoCodec === 'wav'
					? 'wav'
					: defaultConfigurationAudioCodec === 'pcm-16'
						? 'wav'
						: defaultConfigurationAudioCodec === 'mp3'
							? 'mp3'
							: 'aac';

	const isVideoCodecAnAudioCodec = NoReactAPIs.isAudioCodec(
		userPreferredVideoCodec,
	);

	if (isVideoCodecAnAudioCodec) {
		return {
			initialAudioCodec: userPreferredVideoCodec as AudioCodec,
			initialRenderType: 'audio',
			initialVideoCodec: userPreferredVideoCodec as Codec,
			initialVideoCodecForAudioTab: userPreferredVideoCodecForAudioTab,
			initialVideoCodecForVideoTab: NoReactAPIs.isAudioCodec(
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
		initialVideoCodecForAudioTab: userPreferredVideoCodecForAudioTab,
		initialVideoCodecForVideoTab: userPreferredVideoCodec,
	};
};
