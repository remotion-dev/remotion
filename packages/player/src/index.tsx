import {calculateScale} from './calculate-scale';
import {PlayerEventEmitterContext} from './emitter-context';
import type {CallbackListener, EventTypes} from './event-emitter';
import { PlayerEmitter} from './event-emitter';
import {useHoverState} from './use-hover-state';
import {usePlayback} from './use-playback';
import {usePlayer} from './use-player';
import {updateAllElementsSizes, useElementSize} from './utils/use-element-size';

export {ErrorFallback, Player} from './Player';
export {PlayerMethods, PlayerRef} from './player-methods';
export type {RenderLoading} from './PlayerUI';
export {PreviewSize} from './utils/preview-size';
export {Size} from './utils/use-element-size';
export type {CallbackListener, EventTypes};

export const PlayerInternals = {
	PlayerEventEmitterContext,
	PlayerEmitter,
	usePlayer,
	usePlayback,
	useElementSize,
	calculateScale,
	useHoverState,
	updateAllElementsSizes,
};
