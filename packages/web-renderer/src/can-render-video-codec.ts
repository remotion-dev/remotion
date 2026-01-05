import {canEncodeVideo} from 'mediabunny';
import type {WebRendererQuality, WebRendererVideoCodec} from './mediabunny-mappings';
import {
	codecToMediabunnyCodec,
	getQualityForWebRendererQuality,
} from './mediabunny-mappings';

/**
 * Options for checking video codec render support.
 */
export type CanRenderVideoCodecOptions = {
	/**
	 * The width of the video in pixels.
	 */
	width?: number;
	/**
	 * The height of the video in pixels.
	 */
	height?: number;
	/**
	 * The bitrate as a number (in bits per second) or a quality preset.
	 */
	bitrate?: number | WebRendererQuality;
};

/**
 * Checks if the browser supports encoding video with the specified codec and options.
 * Uses the mediabunny library to perform the capability check.
 *
 * @param codec - The video codec to check support for ('h264', 'h265', 'vp8', 'vp9', or 'av1')
 * @param options - Optional configuration including width, height, and bitrate
 * @returns A promise that resolves to true if encoding is supported, false otherwise
 *
 * @example
 * ```tsx
 * import {canRenderVideoCodec} from '@remotion/web-renderer';
 *
 * const canRender = await canRenderVideoCodec('h264', {
 *   width: 1920,
 *   height: 1080,
 *   bitrate: 'high',
 * });
 * ```
 */
export const canRenderVideoCodec = async (
	codec: WebRendererVideoCodec,
	options: CanRenderVideoCodecOptions = {},
): Promise<boolean> => {
	const mediabunnyCodec = codecToMediabunnyCodec(codec);

	const mediabunnyOptions: {
		width?: number;
		height?: number;
		bitrate?: number | ReturnType<typeof getQualityForWebRendererQuality>;
	} = {};

	if (options.width !== undefined) {
		mediabunnyOptions.width = options.width;
	}

	if (options.height !== undefined) {
		mediabunnyOptions.height = options.height;
	}

	if (options.bitrate !== undefined) {
		mediabunnyOptions.bitrate =
			typeof options.bitrate === 'number'
				? options.bitrate
				: getQualityForWebRendererQuality(options.bitrate);
	}

	return canEncodeVideo(mediabunnyCodec, mediabunnyOptions);
};
