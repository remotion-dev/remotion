import type {Codec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderType} from '../../editor/components/RenderModal/RenderModalAdvanced';

export const getDefaultCodecs = ({
	defaultCodec,
	renderType,
}: {
	defaultCodec: Codec;
	renderType: RenderType;
}): {
	initialAudioCodec: Codec;
	initialVideoCodec: Codec;
	initialRenderType: RenderType;
} => {
	const isAudioCodec = BrowserSafeApis.isAudioCodec(defaultCodec);
	return {
		initialAudioCodec: isAudioCodec ? defaultCodec : 'mp3',
		initialVideoCodec: isAudioCodec ? 'h264' : defaultCodec,
		initialRenderType: isAudioCodec ? 'audio' : renderType,
	};
};
