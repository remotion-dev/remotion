import {calculateScale} from './calculate-scale';
import {PlayerEventEmitterContext} from './emitter-context';
import {CallbackListener, EventTypes, PlayerEmitter} from './event-emitter';
import {ErrorFallback} from './Player';
import {useHoverState} from './use-hover-state';
import {usePlayback} from './use-playback';
import {usePlayer} from './use-player';
import {useElementSize} from './utils/use-element-size';

export {Player} from './Player';
export {PlayerMethods, PlayerRef} from './player-methods';
export {PreviewSize} from './utils/preview-size';
export {Size} from './utils/use-element-size';

export const PlayerInternals = {
	PlayerEventEmitterContext,
	PlayerEmitter,
	usePlayer,
	usePlayback,
	useElementSize,
	calculateScale,
	useHoverState,
};

export type {ErrorFallback, CallbackListener, EventTypes};
