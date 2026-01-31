import {
	ClockWipeDemo,
	CubeDemo,
	CustomTimingDemo,
	CustomTransitionDemo,
	FadeDemo,
	FlipDemo,
	IrisDemo,
	NoneDemo,
	SlideDemo,
	SlideDemoLongDurationRest,
	WipeDemo,
} from '../transitions/previews';
import {CircleDemo} from './Circle';
import {EllipseDemo} from './Ellipse';
import {HeartDemo} from './Heart';
import {LightLeakDemoComp} from './LightLeakDemo';
import {NoiseComp} from './NoiseDemo';
import {PieDemo} from './Pie';
import {PolygonDemo} from './Polygon';
import {RectDemo} from './Rect';
import {RoundedTextBox} from './RoundedTextBox';
import {SpringDemo} from './Spring';
import {StarDemo} from './Star';
import {AnimationMath} from './SubtractAnimations';
import {
	OpacityDemo,
	RotateDemo,
	ScaleDemo,
	SkewDemo,
	TranslateDemo,
} from './Translate';
import {ShaderDemoComp} from './ShaderDemo';
import {TriangleDemo} from './Triangle';

export type Option = {
	name: string;
	optional: 'no' | 'default-enabled' | 'default-disabled';
} & (
	| {
			type: 'numeric';
			min: number;
			default: number;
			max: number;
			step: number;
	  }
	| {
			type: 'boolean';
			default: boolean;
	  }
	| {
			type: 'enum';
			default: string;
			values: string[];
	  }
	| {
			type: 'string';
			default: string;
			optional: 'no';
	  }
);

export type DemoType = {
	id: string;
	comp: React.FC;
	compWidth: number;
	compHeight: number;
	fps: number;
	durationInFrames: number;
	options: Option[];
	autoPlay: boolean;
};

export const rectDemo: DemoType = {
	comp: RectDemo,
	compWidth: 1280,
	compHeight: 400,
	durationInFrames: 150,
	fps: 30,
	id: 'rect',
	autoPlay: false,
	options: [
		{
			default: 200,
			max: 1000,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'width',
			optional: 'no',
		},
		{
			default: 200,
			max: 1000,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'height',
			optional: 'no',
		},
		{
			name: 'cornerRadius',
			default: 0,
			max: 100,
			min: 0,
			step: 1,
			type: 'numeric',
			optional: 'no',
		},
		{
			name: 'edgeRoundness',
			default: 1,
			max: 2,
			min: -2,
			step: 0.01,
			type: 'numeric',
			optional: 'default-disabled',
		},
		{
			name: 'debug',
			type: 'boolean',
			optional: 'no',
			default: false,
		},
	],
};

export const triangleDemo: DemoType = {
	comp: TriangleDemo,
	compWidth: 1280,
	compHeight: 400,
	durationInFrames: 150,
	fps: 30,
	id: 'triangle',
	autoPlay: false,
	options: [
		{
			default: 200,
			max: 1000,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'length',
			optional: 'no',
		},
		{
			name: 'edgeRoundness',
			default: 1,
			max: 2,
			min: -2,
			step: 0.01,
			type: 'numeric',
			optional: 'default-disabled',
		},
		{
			name: 'cornerRadius',
			default: 0,
			max: 100,
			min: 0,
			step: 1,
			type: 'numeric',
			optional: 'no',
		},
		{
			name: 'direction',
			type: 'enum',
			default: 'up',
			values: ['up', 'down', 'left', 'right'],
			optional: 'no',
		},
		{
			name: 'debug',
			type: 'boolean',
			optional: 'no',
			default: false,
		},
	],
};

export const circleDemo: DemoType = {
	comp: CircleDemo,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'circle',
	autoPlay: false,
	options: [
		{
			default: 200,
			max: 1000,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'radius',
			optional: 'no',
		},
	],
};

export const heartDemo: DemoType = {
	comp: HeartDemo,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'heart',
	autoPlay: false,
	options: [
		{
			default: 300,
			max: 1000,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'height',
			optional: 'no',
		},
		{
			default: 1.1,
			max: 2,
			step: 0.01,
			min: 0.5,
			type: 'numeric',
			name: 'aspectRatio',
			optional: 'no',
		},
		{
			default: 0,
			max: 0.2,
			step: 0.01,
			min: -0.2,
			type: 'numeric',
			name: 'depthAdjustment',
			optional: 'no',
		},
		{
			default: 0,
			max: 0.3,
			step: 0.01,
			min: -0.3,
			type: 'numeric',
			name: 'bottomRoundnessAdjustment',
			optional: 'no',
		},
		{
			type: 'boolean',
			name: 'debug',
			optional: 'no',
			default: true,
		},
		{
			type: 'boolean',
			name: 'showStrokeInsteadPlaygroundOnly',
			optional: 'no',
			default: true,
		},
	],
};

export const translateDemo: DemoType = {
	comp: TranslateDemo,
	autoPlay: false,
	compHeight: 400,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'translate',
	options: [
		{
			default: 0,
			max: 800,
			step: 5,
			min: -800,
			type: 'numeric',
			name: 'translateX',
			optional: 'no',
		},
		{
			default: 0,
			max: 800,
			step: 5,
			min: -800,
			type: 'numeric',
			name: 'translateY',
			optional: 'no',
		},
	],
};

export const skewDemo: DemoType = {
	comp: SkewDemo,
	autoPlay: false,
	compHeight: 400,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'skew',
	options: [
		{
			default: 0,
			max: 180,
			step: 1,
			min: -180,
			type: 'numeric',
			name: 'skew',
			optional: 'no',
		},
	],
};

export const scaleDemo: DemoType = {
	comp: ScaleDemo,
	autoPlay: false,
	compHeight: 400,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'scale',
	options: [
		{
			default: 1,
			max: 4,
			step: 0.01,
			min: -4,
			type: 'numeric',
			name: 'scale',
			optional: 'no',
		},
	],
};

export const opacityDemo: DemoType = {
	comp: OpacityDemo,
	autoPlay: false,
	compHeight: 400,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'opacity',
	options: [
		{
			default: 1,
			max: 1,
			step: 0.01,
			min: 0,
			type: 'numeric',
			name: 'opacity',
			optional: 'no',
		},
	],
};

export const rotateDemo: DemoType = {
	comp: RotateDemo,
	autoPlay: false,
	compHeight: 400,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'rotate',
	options: [
		{
			default: 0,
			max: 180,
			step: 1,
			min: -180,
			type: 'numeric',
			name: 'rotateZ',
			optional: 'no',
		},
	],
};

export const pieDemo: DemoType = {
	comp: PieDemo,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'pie',
	autoPlay: false,
	options: [
		{
			default: 200,
			max: 1000,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'radius',
			optional: 'no',
		},
		{
			default: 0.5,
			step: 0.01,
			min: 0,
			max: 1,
			type: 'numeric',
			name: 'progress',
			optional: 'no',
		},
		{
			default: 0,
			step: 0.01,
			min: -3.14 * 2,
			max: 3.14 * 2,
			type: 'numeric',
			name: 'rotation',
			optional: 'no',
		},
		{
			default: true,
			type: 'boolean',
			name: 'closePath',
			optional: 'no',
		},
		{
			default: false,
			type: 'boolean',
			name: 'counterClockwise',
			optional: 'no',
		},
		{
			default: false,
			type: 'boolean',
			name: 'showStrokeInsteadPlaygroundOnly',
			optional: 'no',
		},
	],
};

export const ellipseDemo: DemoType = {
	comp: EllipseDemo,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'ellipse',
	autoPlay: false,
	options: [
		{
			default: 150,
			max: 1000,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'rx',
			optional: 'no',
		},
		{
			default: 200,
			max: 1000,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'ry',
			optional: 'no',
		},
	],
};
export const polygonDemo: DemoType = {
	comp: PolygonDemo,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'polygon',
	autoPlay: false,
	options: [
		{
			default: 3,
			max: 12,
			step: 1,
			min: 3,
			type: 'numeric',
			name: 'points',
			optional: 'no',
		},
		{
			default: 100,
			max: 400,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'radius',
			optional: 'no',
		},
		{
			name: 'cornerRadius',
			default: 0,
			max: 140,
			min: 0,
			step: 1,
			type: 'numeric',
			optional: 'no',
		},
		{
			name: 'edgeRoundness',
			default: 0,
			max: 2,
			min: -2,
			step: 0.01,
			type: 'numeric',
			optional: 'default-disabled',
		},
	],
};

export const starDemo: DemoType = {
	comp: StarDemo,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'star',
	autoPlay: false,
	options: [
		{
			default: 100,
			max: 400,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'innerRadius',
			optional: 'no',
		},
		{
			default: 200,
			max: 400,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'outerRadius',
			optional: 'no',
		},
		{
			name: 'edgeRoundness',
			default: 1,
			max: 2,
			min: -2,
			step: 0.01,
			type: 'numeric',
			optional: 'default-disabled',
		},
		{
			name: 'points',
			default: 5,
			max: 50,
			min: 3,
			step: 1,
			type: 'numeric',
			optional: 'no',
		},
		{
			name: 'cornerRadius',
			default: 0,
			max: 200,
			min: 0,
			step: 1,
			type: 'numeric',
			optional: 'no',
		},
	],
};

export const noiseDemo: DemoType = {
	comp: NoiseComp,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'noise',
	autoPlay: true,
	options: [
		{
			default: 0.01,
			max: 0.025,
			min: 0.001,
			step: 0.001,
			type: 'numeric',
			name: 'speed',
			optional: 'no',
		},
		{
			min: 0,
			max: 100,
			step: 1,
			default: 50,
			name: 'maxOffset',
			type: 'numeric',
			optional: 'no',
		},
		{
			name: 'circleRadius',
			default: 5,
			max: 20,
			min: 2,
			step: 1,
			type: 'numeric',
			optional: 'no',
		},
	],
};

export const fadePresentationDemo: DemoType = {
	comp: FadeDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'fade',
	autoPlay: true,
	options: [],
};

export const slidePresentationDemo: DemoType = {
	comp: SlideDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'slide',
	autoPlay: true,
	options: [
		{
			type: 'enum',
			name: 'direction',
			default: 'from-left',
			optional: 'no',
			values: ['from-left', 'from-bottom', 'from-right', 'from-top'],
		},
	],
};
export const flipPresentationDemo: DemoType = {
	comp: FlipDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'flip',
	autoPlay: true,
	options: [
		{
			type: 'enum',
			name: 'direction',
			default: 'from-left',
			optional: 'no',
			values: ['from-left', 'from-bottom', 'from-right', 'from-top'],
		},
	],
};

export const nonePresentationDemo: DemoType = {
	comp: NoneDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'none',
	autoPlay: true,
	options: [],
};

export const slidePresentationDemoLongThreshold: DemoType = {
	comp: SlideDemoLongDurationRest,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 90,
	fps: 30,
	id: 'slide-long-duration-rest',
	autoPlay: true,
	options: [],
};

export const wipePresentationDemo: DemoType = {
	comp: WipeDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'wipe',
	autoPlay: true,
	options: [
		{
			type: 'enum',
			name: 'direction',
			default: 'from-left',
			optional: 'no',
			values: [
				'from-left',
				'from-top-left',
				'from-top',
				'from-top-right',
				'from-right',
				'from-bottom-right',
				'from-bottom',
				'from-bottom-left',
			],
		},
	],
};

export const roundedTextBoxDemo: DemoType = {
	comp: RoundedTextBox,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 60,
	fps: 30,
	id: 'rounded-text-box',
	autoPlay: true,
	options: [
		{
			type: 'enum',
			name: 'textAlign',
			default: 'center',
			optional: 'no',
			values: ['left', 'center', 'right'],
		},
		{
			type: 'numeric',
			name: 'maxLines',
			default: 3,
			max: 10,
			step: 1,
			min: 1,
			optional: 'no',
		},
		{
			type: 'numeric',
			name: 'borderRadius',
			default: 20,
			max: 100,
			step: 1,
			min: 0,
			optional: 'no',
		},
		{
			type: 'numeric',
			name: 'horizontalPadding',
			default: 20,
			max: 100,
			step: 1,
			min: 0,
			optional: 'no',
		},
		{
			type: 'string',
			name: 'text',
			default:
				'Try editing this text and the parameters! A rounded text box, like you see on TikTok, will be created.',
			optional: 'no',
		},
	],
};

export const clockWipePresentationDemo: DemoType = {
	comp: ClockWipeDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'clock-wipe',
	autoPlay: true,
	options: [],
};

export const irisPresentationDemo: DemoType = {
	comp: IrisDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 90,
	fps: 30,
	id: 'iris',
	autoPlay: true,
	options: [],
};

export const cubePresentationDemo: DemoType = {
	comp: CubeDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'cube',
	autoPlay: true,
	options: [
		{
			type: 'enum',
			name: 'direction',
			default: 'from-left',
			optional: 'no',
			values: ['from-left', 'from-top', 'from-right', 'from-bottom'],
		},
	],
};

export const customPresentationDemo: DemoType = {
	comp: CustomTransitionDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'custom-presentation',
	autoPlay: true,
	options: [],
};

export const customTimingDemo: DemoType = {
	comp: CustomTimingDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'custom-timing',
	autoPlay: true,
	options: [],
};

export const animationMathDemo: DemoType = {
	comp: AnimationMath,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 120,
	fps: 30,
	id: 'animation-math',
	autoPlay: true,
	options: [],
};

export const springDemo: DemoType = {
	comp: SpringDemo,
	compHeight: 400,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'spring',
	autoPlay: true,
	options: [
		{
			name: 'damping',
			type: 'numeric',
			default: 10,
			min: 0,
			max: 100,
			step: 1,
			optional: 'no',
		},
		{
			name: 'mass',
			type: 'numeric',
			default: 1,
			min: 0.1,
			max: 10,
			step: 0.1,
			optional: 'no',
		},
		{
			name: 'stiffness',
			type: 'numeric',
			default: 100,
			min: 1,
			max: 500,
			step: 1,
			optional: 'no',
		},
		{
			name: 'durationInFrames',
			type: 'numeric',
			default: 30,
			min: 1,
			max: 120,
			step: 1,
			optional: 'default-disabled',
		},
		{
			name: 'overshootClamping',
			type: 'boolean',
			default: false,
			optional: 'no',
		},
		{
			name: 'reverse',
			type: 'boolean',
			default: false,
			optional: 'no',
		},
	],
};

export const shaderDemo: DemoType = {
	comp: ShaderDemoComp,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 150,
	fps: 30,
	id: 'shader',
	autoPlay: true,
	options: [],
};

export const springDampingDemo: DemoType = {
	comp: SpringDemo,
	compHeight: 400,
	compWidth: 1280,
	durationInFrames: 60,
	fps: 30,
	id: 'spring-damping',
	autoPlay: true,
	options: [
		{
			name: 'damping',
			type: 'numeric',
			default: 100,
			min: 1,
			max: 200,
			step: 1,
			optional: 'no',
		},
	],
};

export const lightLeakDemo: DemoType = {
	comp: LightLeakDemoComp,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 90,
	fps: 30,
	id: 'light-leak',
	autoPlay: true,
	options: [
		{
			name: 'seed',
			type: 'numeric',
			default: 0,
			min: 0,
			max: 100,
			step: 1,
			optional: 'no',
		},
		{
			name: 'hueShift',
			type: 'numeric',
			default: 0,
			min: 0,
			max: 360,
			step: 1,
			optional: 'no',
		},
	],
};
