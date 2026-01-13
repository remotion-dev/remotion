import type {SpringConfig} from 'remotion';

export type EasingType =
	| 'linear'
	| 'ease'
	| 'ease-in-quad'
	| 'ease-out-quad'
	| 'ease-in-out-quad'
	| 'ease-in-cubic'
	| 'ease-out-cubic'
	| 'ease-in-out-cubic'
	| 'ease-in-sin'
	| 'ease-out-sin'
	| 'ease-in-out-sin'
	| 'ease-in-exp'
	| 'ease-out-exp'
	| 'ease-in-out-exp'
	| 'ease-in-circle'
	| 'ease-out-circle'
	| 'ease-in-out-circle'
	| 'ease-in-bounce'
	| 'ease-out-bounce'
	| 'ease-in-out-bounce';

export type SpringTimingConfig = {
	type: 'spring';
	springConfig: SpringConfig;
	reverse: boolean;
	durationInFrames: number | null;
	delay: number;
};

export type InterpolateTimingConfig = {
	type: 'interpolate';
	easing: EasingType;
	durationInFrames: number;
	delay: number;
};

export type SineTimingConfig = {
	type: 'sine';
	durationInFrames: number;
	amplitude: number;
	frequency: number;
	frameOffset: number;
};

export type TimingConfig =
	| SpringTimingConfig
	| InterpolateTimingConfig
	| SineTimingConfig;
