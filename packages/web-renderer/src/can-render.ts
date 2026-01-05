import {canEncodeAudio, canEncodeVideo} from 'mediabunny';
import {getDefaultAudioEncodingConfig} from './get-audio-encoding-config';
import type {
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
	WebRendererVideoCodec,
} from './mediabunny-mappings';
import {
	codecToMediabunnyCodec,
	getDefaultVideoCodecForContainer,
	getQualityForWebRendererQuality,
} from './mediabunny-mappings';

/**
 * Options for checking render support, mirroring renderMediaOnWeb options.
 */
export type CanRenderOptions = {
	/**
	 * The container format. Default is 'mp4'.
	 */
	container?: WebRendererContainer;
	/**
	 * The video codec. Default depends on container ('h264' for mp4, 'vp8' for webm).
	 */
	videoCodec?: WebRendererVideoCodec;
	/**
	 * The width of the video in pixels.
	 */
	width?: number;
	/**
	 * The height of the video in pixels.
	 */
	height?: number;
	/**
	 * The video bitrate as a number (bits per second) or quality preset.
	 * Default is 'medium'.
	 */
	videoBitrate?: number | WebRendererQuality;
	/**
	 * Hardware acceleration preference. Default is 'no-preference'.
	 */
	hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software';
	/**
	 * If true, skip audio codec check. Default is false.
	 */
	muted?: boolean;
};

/**
 * Result of the canRender check with detailed information.
 */
export type CanRenderResult = {
	/**
	 * Whether the render can be performed (all required codecs are supported).
	 */
	canRender: boolean;
	/**
	 * Video codec support information.
	 */
	video: {
		/**
		 * The video codec that was checked.
		 */
		codec: WebRendererVideoCodec;
		/**
		 * Whether the video codec is supported with the given parameters.
		 */
		supported: boolean;
	};
	/**
	 * Audio codec support information. Null if muted is true.
	 */
	audio: {
		/**
		 * The audio codec that was checked, or null if no supported codec was found.
		 */
		codec: WebRendererAudioCodec | null;
		/**
		 * Whether audio encoding is supported.
		 */
		supported: boolean;
	} | null;
};

/**
 * Checks if the browser supports rendering with the specified options.
 * Use this function to verify browser capabilities before calling renderMediaOnWeb().
 *
 * The options mirror renderMediaOnWeb() options, using the same defaults.
 * Returns structured data so you can provide appropriate feedback to users.
 *
 * @param options - Configuration options mirroring renderMediaOnWeb
 * @returns A promise resolving to detailed support information
 *
 * @example
 * ```tsx
 * import {canRender} from '@remotion/web-renderer';
 *
 * const result = await canRender({
 *   container: 'mp4',
 *   width: 1920,
 *   height: 1080,
 * });
 *
 * if (!result.canRender) {
 *   if (!result.video.supported) {
 *     console.log(`Video codec ${result.video.codec} is not supported`);
 *   }
 *   if (result.audio && !result.audio.supported) {
 *     console.log('No supported audio codec found');
 *   }
 * }
 * ```
 */
export const canRender = async (
	options: CanRenderOptions = {},
): Promise<CanRenderResult> => {
	const container = options.container ?? 'mp4';
	const videoCodec =
		options.videoCodec ?? getDefaultVideoCodecForContainer(container);
	const muted = options.muted ?? false;
	const hardwareAcceleration = options.hardwareAcceleration ?? 'no-preference';

	// Check video codec support
	const mediabunnyVideoCodec = codecToMediabunnyCodec(videoCodec);
	const videoOptions: {
		width?: number;
		height?: number;
		bitrate?: number | ReturnType<typeof getQualityForWebRendererQuality>;
		hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software';
	} = {
		hardwareAcceleration,
	};

	if (options.width !== undefined) {
		videoOptions.width = options.width;
	}

	if (options.height !== undefined) {
		videoOptions.height = options.height;
	}

	if (options.videoBitrate !== undefined) {
		videoOptions.bitrate =
			typeof options.videoBitrate === 'number'
				? options.videoBitrate
				: getQualityForWebRendererQuality(options.videoBitrate);
	}

	const videoSupported = await canEncodeVideo(
		mediabunnyVideoCodec,
		videoOptions,
	);

	// If muted, skip audio check
	if (muted) {
		return {
			canRender: videoSupported,
			video: {
				codec: videoCodec,
				supported: videoSupported,
			},
			audio: null,
		};
	}

	// Check audio codec support using the same logic as renderMediaOnWeb
	const audioConfig = await getDefaultAudioEncodingConfig();
	const audioSupported = audioConfig !== null;
	const audioCodec: WebRendererAudioCodec | null = audioConfig?.codec as
		| WebRendererAudioCodec
		| null;

	return {
		canRender: videoSupported && audioSupported,
		video: {
			codec: videoCodec,
			supported: videoSupported,
		},
		audio: {
			codec: audioCodec,
			supported: audioSupported,
		},
	};
};
