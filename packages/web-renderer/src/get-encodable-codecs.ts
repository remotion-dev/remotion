import {
	getEncodableAudioCodecs as mediabunnyGetEncodableAudioCodecs,
	getEncodableVideoCodecs as mediabunnyGetEncodableVideoCodecs,
} from 'mediabunny';
import {
	codecToMediabunnyCodec,
	getQualityForWebRendererQuality,
	getSupportedAudioCodecsForContainer,
	getSupportedVideoCodecsForContainer,
	type WebRendererAudioCodec,
	type WebRendererContainer,
	type WebRendererQuality,
	type WebRendererVideoCodec,
} from './mediabunny-mappings';

export type GetEncodableVideoCodecsOptions = {
	videoBitrate?: number | WebRendererQuality;
};

export type GetEncodableAudioCodecsOptions = {
	audioBitrate?: number | WebRendererQuality;
};

export const getEncodableVideoCodecs = async (
	container: WebRendererContainer,
	options?: GetEncodableVideoCodecsOptions,
): Promise<WebRendererVideoCodec[]> => {
	const supported = getSupportedVideoCodecsForContainer(container);
	const mediabunnyCodecs = supported.map(codecToMediabunnyCodec);

	const resolvedBitrate = options?.videoBitrate
		? typeof options.videoBitrate === 'number'
			? options.videoBitrate
			: getQualityForWebRendererQuality(options.videoBitrate)
		: undefined;

	const encodable = await mediabunnyGetEncodableVideoCodecs(mediabunnyCodecs, {
		bitrate: resolvedBitrate,
	});

	return supported.filter((c) => encodable.includes(codecToMediabunnyCodec(c)));
};

export const getEncodableAudioCodecs = async (
	container: WebRendererContainer,
	options?: GetEncodableAudioCodecsOptions,
): Promise<WebRendererAudioCodec[]> => {
	const supported = getSupportedAudioCodecsForContainer(container);

	const resolvedBitrate = options?.audioBitrate
		? typeof options.audioBitrate === 'number'
			? options.audioBitrate
			: getQualityForWebRendererQuality(options.audioBitrate)
		: undefined;

	const encodable = await mediabunnyGetEncodableAudioCodecs(supported, {
		bitrate: resolvedBitrate,
	});

	return supported.filter((c) => encodable.includes(c));
};
