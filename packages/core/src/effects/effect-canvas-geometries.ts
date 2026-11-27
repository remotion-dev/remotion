import type {EffectChainState} from './run-effect-chain.js';

export type EffectCanvasGeometry = Pick<
	EffectChainState,
	'width' | 'height' | 'contentRect'
>;

// Visible canvases and picker snapshots share their original effect coordinate system.
export const effectCanvasGeometries = new WeakMap<Node, EffectCanvasGeometry>();
