import {calculateCanvasTransformation} from './calculate-scale';
import {PlayerEventEmitterContext} from './emitter-context';
import type {CallbackListener, EventTypes} from './event-emitter';
import {PlayerEmitter} from './event-emitter';
import {useHoverState} from './use-hover-state';
import {usePlayback} from './use-playback';
import {usePlayer} from './use-player';
import {updateAllElementsSizes, useElementSize} from './utils/use-element-size';

export {ErrorFallback, Player, PlayerProps} from './Player';
export {PlayerMethods, PlayerRef} from './player-methods';
export type {RenderLoading, RenderPoster} from './PlayerUI';
export {PreviewSize, Translation} from './utils/preview-size';
export {Size} from './utils/use-element-size';
export type {CallbackListener, EventTypes};

export const PlayerInternals = {
	PlayerEventEmitterContext,
	PlayerEmitter,
	usePlayer,
	usePlayback,
	useElementSize,
	calculateCanvasTransformation,
	useHoverState,
	updateAllElementsSizes,
};
