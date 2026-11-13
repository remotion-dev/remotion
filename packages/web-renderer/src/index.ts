import './symbol-dispose';
import {
	getDefaultAudioCodecForContainer as internalGetDefaultAudioCodecForContainer,
	getDefaultContainerForCodec as internalGetDefaultContainerForCodec,
	getDefaultVideoCodecForContainer as internalGetDefaultVideoCodecForContainer,
	getSupportedAudioCodecsForContainer as internalGetSupportedAudioCodecsForContainer,
	getSupportedVideoCodecsForContainer as internalGetSupportedVideoCodecsForContainer,
	isAudioOnlyContainer as internalIsAudioOnlyContainer,
} from './mediabunny-mappings';

export type {EmittedArtifact, WebRendererOnArtifact} from './artifact';
export {canRenderMediaOnWeb} from './can-render-media-on-web';
export type {
	CanRenderIssue,
	CanRenderMediaOnWebOptions,
	CanRenderMediaOnWebResult,
} from './can-render-media-on-web';
export type {FrameRange} from './frame-range';
export {
	getEncodableAudioCodecs,
	getEncodableVideoCodecs,
	type GetEncodableAudioCodecsOptions,
	type GetEncodableVideoCodecsOptions,
} from './get-encodable-codecs';
export type {
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
	WebRendererVideoCodec,
} from './mediabunny-mappings';
export type {WebRendererOutputTarget} from './output-target';
export type {WebRendererPageResponsiveness} from './page-responsiveness';
export {renderMediaOnWeb} from './render-media-on-web';
export type {
	RenderMediaOnWebOptions,
	RenderMediaOnWebProgress,
	RenderMediaOnWebProgressCallback,
	RenderMediaOnWebResult,
	WebRendererHardwareAcceleration,
} from './render-media-on-web';
export {renderFramesOnWeb, renderStillOnWeb} from './render-still-on-web';
export type {
	RenderFramesOnWebOptions,
	RenderStillOnWebEncodeOptions,
	RenderStillOnWebImageFormat,
	RenderStillOnWebOptions,
	RenderStillOnWebResult,
} from './render-still-on-web';
export type {HtmlInCanvasLayerOutcome} from './take-screenshot';
export type {OnFrameCallback} from './validate-video-frame';

/**
 * @deprecated Internal API that will be removed from the public exports.
 */
export const getDefaultAudioCodecForContainer =
	internalGetDefaultAudioCodecForContainer;

/**
 * @deprecated Internal API that will be removed from the public exports.
 */
export const getDefaultContainerForCodec = internalGetDefaultContainerForCodec;

/**
 * @deprecated Internal API that will be removed from the public exports.
 */
export const getDefaultVideoCodecForContainer =
	internalGetDefaultVideoCodecForContainer;

/**
 * @deprecated Internal API that will be removed from the public exports.
 */
export const getSupportedAudioCodecsForContainer =
	internalGetSupportedAudioCodecsForContainer;

/**
 * @deprecated Internal API that will be removed from the public exports.
 */
export const getSupportedVideoCodecsForContainer =
	internalGetSupportedVideoCodecsForContainer;

/**
 * @deprecated Internal API that will be removed from the public exports.
 */
export const isAudioOnlyContainer = internalIsAudioOnlyContainer;

export const WebRendererInternals = {
	getDefaultAudioCodecForContainer: internalGetDefaultAudioCodecForContainer,
	getDefaultContainerForCodec: internalGetDefaultContainerForCodec,
	getDefaultVideoCodecForContainer: internalGetDefaultVideoCodecForContainer,
	getSupportedAudioCodecsForContainer:
		internalGetSupportedAudioCodecsForContainer,
	getSupportedVideoCodecsForContainer:
		internalGetSupportedVideoCodecsForContainer,
	isAudioOnlyContainer: internalIsAudioOnlyContainer,
};
