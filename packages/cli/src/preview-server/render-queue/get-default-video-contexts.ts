import type {Codec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderType} from '../../editor/components/RenderModal/RenderModal';

export const getDefaultCodecs = ({
	defaultCodec,
	isStill,
}: {
	defaultCodec: Codec;
	isStill: boolean;
}): {
	initialAudioCodec: Codec;
	initialVideoCodec: Codec;
	initialRenderType: RenderType;
} => {
	const isAudioCodec = BrowserSafeApis.isAudioCodec(defaultCodec);

	return {
		initialAudioCodec: isAudioCodec ? defaultCodec : 'mp3',
		initialVideoCodec: isAudioCodec ? 'h264' : defaultCodec,
		initialRenderType: isStill ? 'still' : isAudioCodec ? 'audio' : 'video',
	};
};
