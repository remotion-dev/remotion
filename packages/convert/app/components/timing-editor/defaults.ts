import type {
	EasingType,
	InterpolateTimingConfig,
	SineTimingConfig,
	SpringTimingConfig,
} from './types';

export const DEFAULT_DAMPING = 10;
export const DEFAULT_MASS = 1;
export const DEFAULT_STIFFNESS = 100;

export const DEFAULT_INTERPOLATE_DURATION = 30;
export const DEFAULT_EASING: EasingType = 'ease-out-cubic';

export const DEFAULT_SINE_DURATION = 60;
export const DEFAULT_SINE_AMPLITUDE = 1;
export const DEFAULT_SINE_FREQUENCY = 1;
export const DEFAULT_SINE_FRAME_OFFSET = 0;

export const DEFAULT_SPRING_CONFIG: SpringTimingConfig = {
	type: 'spring',
	springConfig: {
		damping: DEFAULT_DAMPING,
		mass: DEFAULT_MASS,
		stiffness: DEFAULT_STIFFNESS,
		overshootClamping: false,
	},
	reverse: false,
	durationInFrames: null,
	delay: 0,
};

export const DEFAULT_INTERPOLATE_CONFIG: InterpolateTimingConfig = {
	type: 'interpolate',
	easing: DEFAULT_EASING,
	durationInFrames: DEFAULT_INTERPOLATE_DURATION,
	delay: 0,
};

export const DEFAULT_SINE_CONFIG: SineTimingConfig = {
	type: 'sine',
	durationInFrames: DEFAULT_SINE_DURATION,
	amplitude: DEFAULT_SINE_AMPLITUDE,
	frequency: DEFAULT_SINE_FREQUENCY,
	frameOffset: DEFAULT_SINE_FRAME_OFFSET,
};

export const EASING_OPTIONS: {value: EasingType; label: string}[] = [
	{value: 'linear', label: 'Linear'},
	{value: 'ease', label: 'Ease'},
	{value: 'ease-in-quad', label: 'Ease In (Quad)'},
	{value: 'ease-out-quad', label: 'Ease Out (Quad)'},
	{value: 'ease-in-out-quad', label: 'Ease In-Out (Quad)'},
	{value: 'ease-in-cubic', label: 'Ease In (Cubic)'},
	{value: 'ease-out-cubic', label: 'Ease Out (Cubic)'},
	{value: 'ease-in-out-cubic', label: 'Ease In-Out (Cubic)'},
	{value: 'ease-in-sin', label: 'Ease In (Sin)'},
	{value: 'ease-out-sin', label: 'Ease Out (Sin)'},
	{value: 'ease-in-out-sin', label: 'Ease In-Out (Sin)'},
	{value: 'ease-in-exp', label: 'Ease In (Exp)'},
	{value: 'ease-out-exp', label: 'Ease Out (Exp)'},
	{value: 'ease-in-out-exp', label: 'Ease In-Out (Exp)'},
	{value: 'ease-in-circle', label: 'Ease In (Circle)'},
	{value: 'ease-out-circle', label: 'Ease Out (Circle)'},
	{value: 'ease-in-out-circle', label: 'Ease In-Out (Circle)'},
	{value: 'ease-in-bounce', label: 'Ease In (Bounce)'},
	{value: 'ease-out-bounce', label: 'Ease Out (Bounce)'},
	{value: 'ease-in-out-bounce', label: 'Ease In-Out (Bounce)'},
];
