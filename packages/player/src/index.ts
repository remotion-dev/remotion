import './_check-rsc.js';
import {BufferingIndicator} from './BufferingIndicator.js';
import {calculateCanvasTransformation} from './calculate-scale.js';
import {PlayerEventEmitterContext} from './emitter-context.js';
import {PlayerEmitterProvider} from './EmitterProvider.js';
import type {CallbackListener, PlayerEventTypes} from './event-emitter.js';
import {PlayerEmitter} from './event-emitter.js';
import {useFrameImperative} from './use-frame-imperative.js';
import {useHoverState} from './use-hover-state.js';
import {usePlayback} from './use-playback.js';
import {usePlayer} from './use-player.js';
import {
	updateAllElementsSizes,
	useElementSize,
} from './utils/use-element-size.js';

export type {RenderMuteButton} from './MediaVolumeSlider.js';
export type {
	PlayerMethods,
	PlayerRef,
	ThumbnailMethods,
	ThumbnailRef,
} from './player-methods.js';
export {Player} from './Player.js';
export type {PlayerProps, PlayerPropsWithoutZod} from './Player.js';
export type {
	RenderFullscreenButton,
	RenderPlayPauseButton,
} from './PlayerControls.js';
export type {ErrorFallback, RenderLoading, RenderPoster} from './PlayerUI.js';
export type {RenderVolumeSlider} from './render-volume-slider.js';
export {Thumbnail} from './Thumbnail.js';
export type {ThumbnailProps, ThumbnailPropsWithoutZod} from './Thumbnail.js';
export type {Size} from './utils/use-element-size.js';
export type {CallbackListener, PlayerEventTypes as EventTypes};

export const PlayerInternals = {
	PlayerEventEmitterContext,
	PlayerEmitter,
	usePlayer,
	usePlayback,
	useElementSize,
	calculateCanvasTransformation,
	useHoverState,
	updateAllElementsSizes,
	PlayerEmitterProvider,
	BufferingIndicator,
	useFrameImperative,
};
