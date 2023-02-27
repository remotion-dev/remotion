import {calculateCanvasTransformation, calculateScale} from './calculate-scale.js';
import {PlayerEventEmitterContext} from './emitter-context.js';
import type {CallbackListener, PlayerEventTypes} from './event-emitter.js';
import {PlayerEmitter} from './event-emitter.js';
import {useHoverState} from './use-hover-state.js';
import {usePlayback} from './use-playback.js';
import {usePlayer} from './use-player.js';
import {updateAllElementsSizes, useElementSize} from './utils/use-element-size.js';

export {Player, PlayerProps} from './Player.js';
export {
	PlayerMethods,
	PlayerRef,
	ThumbnailMethods,
	ThumbnailRef,
} from './player-methods.js';
export type {
	RenderFullscreenButton,
	RenderPlayPauseButton,
} from './PlayerControls.js';
export type {ErrorFallback, RenderLoading, RenderPoster} from './PlayerUI.js';
export {Thumbnail} from './Thumbnail.js';
export {PreviewSize, Translation} from './utils/preview-size.js';
export {Size} from './utils/use-element-size.js';
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
	calculateScale,
};
