import {canEncodeAudio} from 'mediabunny';
import type {
	WebRendererAudioCodec,
	WebRendererQuality,
} from './mediabunny-mappings';
import {
	audioCodecToMediabunnyCodec,
	getQualityForWebRendererQuality,
} from './mediabunny-mappings';

/**
 * Options for checking audio codec render support.
 */
export type CanRenderAudioCodecOptions = {
	/**
	 * The number of audio channels.
	 */
	numberOfChannels?: number;
	/**
	 * The sample rate in Hz.
	 */
	sampleRate?: number;
	/**
	 * The bitrate as a number (in bits per second) or a quality preset.
	 */
	bitrate?: number | WebRendererQuality;
};

/**
 * Checks if the browser supports encoding audio with the specified codec and options.
 * Uses the mediabunny library to perform the capability check.
 *
 * @param codec - The audio codec to check support for ('aac' or 'opus')
 * @param options - Optional configuration including numberOfChannels, sampleRate, and bitrate
 * @returns A promise that resolves to true if encoding is supported, false otherwise
 *
 * @example
 * ```tsx
 * import {canRenderAudioCodec} from '@remotion/web-renderer';
 *
 * const canRender = await canRenderAudioCodec('aac', {
 *   sampleRate: 44100,
 *   numberOfChannels: 2,
 *   bitrate: 'medium',
 * });
 * ```
 */
export const canRenderAudioCodec = async (
	codec: WebRendererAudioCodec,
	options: CanRenderAudioCodecOptions = {},
): Promise<boolean> => {
	const mediabunnyCodec = audioCodecToMediabunnyCodec(codec);

	const mediabunnyOptions: {
		numberOfChannels?: number;
		sampleRate?: number;
		bitrate?: number | ReturnType<typeof getQualityForWebRendererQuality>;
	} = {};

	if (options.numberOfChannels !== undefined) {
		mediabunnyOptions.numberOfChannels = options.numberOfChannels;
	}

	if (options.sampleRate !== undefined) {
		mediabunnyOptions.sampleRate = options.sampleRate;
	}

	if (options.bitrate !== undefined) {
		mediabunnyOptions.bitrate =
			typeof options.bitrate === 'number'
				? options.bitrate
				: getQualityForWebRendererQuality(options.bitrate);
	}

	return canEncodeAudio(mediabunnyCodec, mediabunnyOptions);
};
