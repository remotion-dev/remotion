import {canEncodeVideo} from 'mediabunny';
import type {
	CanRenderIssue,
	CanRenderMediaOnWebOptions,
	CanRenderMediaOnWebResult,
} from './can-render-types';
import {canUseWebFsWriter} from './can-use-webfs-target';
import {checkWebGLSupport} from './check-webgl-support';
import {
	codecToMediabunnyCodec,
	containerToMediabunnyContainer,
	getDefaultVideoCodecForContainer,
	getQualityForWebRendererQuality,
} from './mediabunny-mappings';
import {resolveAudioCodec} from './resolve-audio-codec';
import {validateDimensions} from './validate-dimensions';

export type {
	CanRenderIssue,
	CanRenderMediaOnWebOptions,
	CanRenderMediaOnWebResult,
} from './can-render-types';

export const canRenderMediaOnWeb = async (
	options: CanRenderMediaOnWebOptions,
): Promise<CanRenderMediaOnWebResult> => {
	const issues: CanRenderIssue[] = [];

	if (typeof VideoEncoder === 'undefined') {
		issues.push({
			type: 'webcodecs-unavailable',
			message:
				'WebCodecs API is not available in this browser. A modern browser with WebCodecs support is required.',
			severity: 'error',
		});
	}

	const container = options.container ?? 'mp4';
	const videoCodec =
		options.videoCodec ?? getDefaultVideoCodecForContainer(container);
	const transparent = options.transparent ?? false;
	const muted = options.muted ?? false;
	const {width, height} = options;

	const resolvedVideoBitrate =
		typeof options.videoBitrate === 'number'
			? options.videoBitrate
			: getQualityForWebRendererQuality(options.videoBitrate ?? 'medium');
	const resolvedAudioBitrate =
		typeof options.audioBitrate === 'number'
			? options.audioBitrate
			: getQualityForWebRendererQuality(options.audioBitrate ?? 'medium');

	const format = containerToMediabunnyContainer(container);
	if (
		!format.getSupportedCodecs().includes(codecToMediabunnyCodec(videoCodec))
	) {
		issues.push({
			type: 'container-codec-mismatch',
			message: `Codec ${videoCodec} is not supported for container ${container}`,
			severity: 'error',
		});
	}

	const dimensionIssue = validateDimensions({width, height, codec: videoCodec});
	if (dimensionIssue) {
		issues.push(dimensionIssue);
	}

	const canEncodeVideoResult = await canEncodeVideo(
		codecToMediabunnyCodec(videoCodec),
		{bitrate: resolvedVideoBitrate},
	);
	if (!canEncodeVideoResult) {
		issues.push({
			type: 'video-codec-unsupported',
			message: `Video codec "${videoCodec}" cannot be encoded by this browser`,
			severity: 'error',
		});
	}

	if (transparent && !['vp8', 'vp9'].includes(videoCodec)) {
		issues.push({
			type: 'transparent-video-unsupported',
			message: `Transparent video requires VP8 or VP9 codec with WebM container. ${videoCodec} does not support alpha channel.`,
			severity: 'error',
		});
	}

	let resolvedAudioCodec: CanRenderMediaOnWebResult['resolvedAudioCodec'] =
		null;
	if (!muted) {
		const audioResult = await resolveAudioCodec({
			container,
			requestedCodec: options.audioCodec,
			userSpecifiedAudioCodec:
				options.audioCodec !== undefined && options.audioCodec !== null,
			bitrate: resolvedAudioBitrate,
		});
		resolvedAudioCodec = audioResult.codec;
		issues.push(...audioResult.issues);
	}

	const webglIssue = checkWebGLSupport();
	if (webglIssue) {
		issues.push(webglIssue);
	}

	const resolvedOutputTarget = (await canUseWebFsWriter())
		? 'web-fs'
		: 'arraybuffer';

	return {
		canRender: issues.filter((i) => i.severity === 'error').length === 0,
		issues,
		resolvedVideoCodec: videoCodec,
		resolvedAudioCodec,
		resolvedOutputTarget,
	};
};
