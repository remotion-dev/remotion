import type {X264Preset} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';

export const DEFAULT_X264_PRESET: X264Preset | null =
	NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? 'veryfast' : null;
