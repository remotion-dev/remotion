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

export type GetEncodableCodecsOptions = {
	bitrate?: number | WebRendererQuality;
};

export const getEncodableVideoCodecs = async (
	container: WebRendererContainer,
	options?: GetEncodableCodecsOptions,
): Promise<WebRendererVideoCodec[]> => {
	const supported = getSupportedVideoCodecsForContainer(container);
	const mediabunnyCodecs = supported.map(codecToMediabunnyCodec);

	const resolvedBitrate = options?.bitrate
		? typeof options.bitrate === 'number'
			? options.bitrate
			: getQualityForWebRendererQuality(options.bitrate)
		: undefined;

	const encodable = await mediabunnyGetEncodableVideoCodecs(mediabunnyCodecs, {
		bitrate: resolvedBitrate,
	});

	return supported.filter((c) => encodable.includes(codecToMediabunnyCodec(c)));
};

export const getEncodableAudioCodecs = async (
	container: WebRendererContainer,
	options?: GetEncodableCodecsOptions,
): Promise<WebRendererAudioCodec[]> => {
	const supported = getSupportedAudioCodecsForContainer(container);

	const resolvedBitrate = options?.bitrate
		? typeof options.bitrate === 'number'
			? options.bitrate
			: getQualityForWebRendererQuality(options.bitrate)
		: undefined;

	const encodable = await mediabunnyGetEncodableAudioCodecs(supported, {
		bitrate: resolvedBitrate,
	});

	return supported.filter((c) => encodable.includes(c));
};
