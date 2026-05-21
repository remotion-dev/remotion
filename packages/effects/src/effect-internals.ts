import {blur} from './blur/index.js';
import {halftone} from './halftone.js';
import {tint} from './tint.js';
import {wave} from './wave.js';

export const EffectInternals = {
	blur,
	halftone,
	tint,
	wave,
} as const;
