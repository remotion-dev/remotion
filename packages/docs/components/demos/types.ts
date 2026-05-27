import type {LogLevel} from 'remotion';
import {EffectsBarrelDistortionPreview} from '../effects/effects-barrel-distortion-preview';
import {EffectsBlurPreview} from '../effects/effects-blur-preview';
import {EffectsBrightnessPreview} from '../effects/effects-brightness-preview';
import {EffectsChromaticAberrationPreview} from '../effects/effects-chromatic-aberration-preview';
import {EffectsContrastPreview} from '../effects/effects-contrast-preview';
import {EffectsDuotonePreview} from '../effects/effects-duotone-preview';
import {EffectsGlowPreview} from '../effects/effects-glow-preview';
import {EffectsGrayscalePreview} from '../effects/effects-grayscale-preview';
import {EffectsHalftoneLinearGradientPreview} from '../effects/effects-halftone-linear-gradient-preview';
import {EffectsHalftonePreview} from '../effects/effects-halftone-preview';
import {EffectsHuePreview} from '../effects/effects-hue-preview';
import {EffectsInvertPreview} from '../effects/effects-invert-preview';
import {EffectsLightLeakPreview} from '../effects/effects-light-leak-preview';
import {EffectsMirrorPreview} from '../effects/effects-mirror-preview';
import {EffectsSaturationPreview} from '../effects/effects-saturation-preview';
import {EffectsScalePreview} from '../effects/effects-scale-preview';
import {EffectsShinePreview} from '../effects/effects-shine-preview';
import {EffectsStarburstPreview} from '../effects/effects-starburst-preview';
import {EffectsTintPreview} from '../effects/effects-tint-preview';
import {
	EffectsUvTranslatePreview,
	EffectsXyTranslatePreview,
} from '../effects/effects-translate-preview';
import {EffectsVignettePreview} from '../effects/effects-vignette-preview';
import {EffectsWavePreview} from '../effects/effects-wave-preview';
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
import {ArrowDemo} from './Arrow';
import {BookFlipDocsDemo} from './BookFlipDemo';
import {CircleDemo} from './Circle';
import {CrosswarpDocsDemo} from './CrosswarpDemo';
import {CrossZoomDocsDemo} from './CrossZoomDemo';
import {DissolveDocsDemo} from './DissolveDemo';
import {DreamyZoomDocsDemo} from './DreamyZoomDemo';
import {EllipseDemo} from './Ellipse';
import {FilmBurnDocsDemo} from './FilmBurnDemo';
import {HeartDemo} from './Heart';
import {HtmlInCanvasDocsDemo2DBlur} from './HtmlInCanvasDocsDemo2DBlur';
import {HtmlInCanvasDocsDemoWebGL} from './HtmlInCanvasDocsDemoWebGL';
import {HtmlInCanvasDocsDemoWebGPU} from './HtmlInCanvasDocsDemoWebGPU';
import {LightLeakDemoComp} from './LightLeakDemo';
import {LinearBlurDocsDemo} from './LinearBlurDemo';
import {NoiseComp} from './NoiseDemo';
import {PieDemo} from './Pie';
import {PolygonDemo} from './Polygon';
import {RectDemo} from './Rect';
import {RippleDocsDemo} from './RippleDemo';
import {RoundedTextBox} from './RoundedTextBox';
import {ShaderDemoComp} from './ShaderDemo';
import {SpringDemo} from './Spring';
import {StarDemo} from './Star';
import {StarburstDemoComp} from './StarburstDemo';
import {AnimationMath} from './SubtractAnimations';
import {SwapDocsDemo} from './SwapDemo';
import {TransitionSeriesEnterExitDemoComp} from './TransitionSeriesEnterExitDemo';
import {TransitionSeriesOverlayDemoComp} from './TransitionSeriesOverlayDemo';
import {TransitionSeriesTransitionDemoComp} from './TransitionSeriesTransitionDemo';
import {
	OpacityDemo,
	RotateDemo,
	ScaleDemo,
	SkewDemo,
	TranslateDemo,
} from './Translate';
import {TriangleDemo} from './Triangle';
import {ZoomBlurDocsDemo} from './ZoomBlurDemo';
import {ZoomInOutDocsDemo} from './ZoomInOutDemo';

export type Option = {
	name: string;
	optional: 'no' | 'default-enabled' | 'default-disabled';
	showIf?: {
		option: string;
		value: string | number | boolean | null;
	};
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
	| {
			type: 'color';
			default: string;
	  }
	| {
			type: 'uv-coordinate';
			min: number;
			default: readonly [number, number];
			max: number;
			step: number;
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
	controls: boolean;
	logLevel: LogLevel;
};

export const arrowDemo: DemoType = {
	comp: ArrowDemo,
	compWidth: 1280,
	compHeight: 400,
	durationInFrames: 150,
	fps: 30,
	id: 'arrow',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			default: 300,
			max: 1000,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'length',
			optional: 'no',
		},
		{
			default: 185,
			max: 400,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'headWidth',
			optional: 'no',
		},
		{
			default: 120,
			max: 400,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'headLength',
			optional: 'no',
		},
		{
			default: 80,
			max: 400,
			step: 5,
			min: 1,
			type: 'numeric',
			name: 'shaftWidth',
			optional: 'no',
		},
		{
			name: 'direction',
			type: 'enum',
			default: 'right',
			values: ['up', 'down', 'left', 'right'],
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
	],
};

export const rectDemo: DemoType = {
	comp: RectDemo,
	compWidth: 1280,
	compHeight: 400,
	durationInFrames: 150,
	fps: 30,
	id: 'rect',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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

export const zoomBlurPresentationDemo: DemoType = {
	comp: ZoomBlurDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'zoom-blur',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const dreamyZoomPresentationDemo: DemoType = {
	comp: DreamyZoomDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'dreamy-zoom',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const filmBurnPresentationDemo: DemoType = {
	comp: FilmBurnDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'film-burn',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const linearBlurPresentationDemo: DemoType = {
	comp: LinearBlurDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'linear-blur',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const zoomInOutPresentationDemo: DemoType = {
	comp: ZoomInOutDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'zoom-in-out',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const bookFlipPresentationDemo: DemoType = {
	comp: BookFlipDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'book-flip',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const dissolvePresentationDemo: DemoType = {
	comp: DissolveDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'dissolve',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const ripplePresentationDemo: DemoType = {
	comp: RippleDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'ripple',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const crosswarpPresentationDemo: DemoType = {
	comp: CrosswarpDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'crosswarp',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const crossZoomPresentationDemo: DemoType = {
	comp: CrossZoomDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'cross-zoom',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const swapPresentationDemo: DemoType = {
	comp: SwapDocsDemo,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 90,
	fps: 30,
	id: 'swap',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [],
};

export const customPresentationDemo: DemoType = {
	comp: CustomTransitionDemo,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'custom-presentation',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: false,
	logLevel: 'info',
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
	controls: true,
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

export const starburstDemo: DemoType = {
	comp: StarburstDemoComp,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 90,
	fps: 30,
	id: 'starburst',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'rays',
			type: 'numeric',
			default: 12,
			min: 2,
			max: 100,
			step: 1,
			optional: 'no',
		},
		{
			name: 'rotation',
			type: 'numeric',
			default: 0,
			min: 0,
			max: 360,
			step: 1,
			optional: 'no',
		},
		{
			name: 'smoothness',
			type: 'numeric',
			default: 0,
			min: 0,
			max: 1,
			step: 0.01,
			optional: 'no',
		},
		{
			name: 'vignette',
			type: 'numeric',
			default: 1,
			min: 0,
			max: 1,
			step: 0.01,
			optional: 'no',
		},
		{
			name: 'originOffsetX',
			type: 'numeric',
			default: 0,
			min: -1,
			max: 1,
			step: 0.01,
			optional: 'no',
		},
		{
			name: 'originOffsetY',
			type: 'numeric',
			default: 0,
			min: -1,
			max: 1,
			step: 0.01,
			optional: 'no',
		},
	],
};

export const transitionSeriesTransitionDemo: DemoType = {
	comp: TransitionSeriesTransitionDemoComp,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 120,
	fps: 30,
	id: 'transition-series-transition',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'presentation',
			type: 'enum',
			default: 'fade',
			values: ['fade', 'slide', 'wipe'],
			optional: 'no',
		},
		{
			name: 'transitionDuration',
			type: 'numeric',
			default: 15,
			min: 5,
			max: 40,
			step: 1,
			optional: 'no',
		},
	],
};

export const transitionSeriesOverlayDemo: DemoType = {
	comp: TransitionSeriesOverlayDemoComp,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 120,
	fps: 30,
	id: 'transition-series-overlay',
	autoPlay: true,
	controls: true,
	options: [
		{
			name: 'overlayDuration',
			type: 'numeric',
			default: 30,
			min: 4,
			max: 60,
			step: 2,
			optional: 'no',
		},
		{
			name: 'offset',
			type: 'numeric',
			default: 0,
			min: -20,
			max: 20,
			step: 1,
			optional: 'no',
		},
	],
};

export const transitionSeriesEnterExitDemo: DemoType = {
	comp: TransitionSeriesEnterExitDemoComp,
	compHeight: 280,
	compWidth: 540,
	durationInFrames: 60,
	fps: 30,
	id: 'transition-series-enter-exit',
	autoPlay: true,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'presentation',
			type: 'enum',
			default: 'slide',
			values: ['slide', 'fade', 'wipe'],
			optional: 'no',
		},
	],
};

export const htmlInCanvasDemo2DBlur: DemoType = {
	comp: HtmlInCanvasDocsDemo2DBlur,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 120,
	fps: 30,
	id: 'html-in-canvas-2d-blur',
	autoPlay: true,
	controls: true,
	logLevel: 'info',
	options: [],
};

export const effectsBrightnessDemo: DemoType = {
	comp: EffectsBrightnessPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-brightness',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'amount',
			type: 'numeric',
			min: -1,
			max: 1,
			step: 0.01,
			default: 0.25,
			optional: 'no',
		},
	],
};

export const effectsContrastDemo: DemoType = {
	comp: EffectsContrastPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-contrast',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'amount',
			type: 'numeric',
			min: 0,
			max: 5,
			step: 0.1,
			default: 1.5,
			optional: 'no',
		},
	],
};

export const effectsGrayscaleDemo: DemoType = {
	comp: EffectsGrayscalePreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-grayscale',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'amount',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 1,
			optional: 'no',
		},
	],
};

export const effectsDuotoneDemo: DemoType = {
	comp: EffectsDuotonePreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-duotone',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'darkColor',
			type: 'color',
			default: 'black',
			optional: 'no',
		},
		{
			name: 'lightColor',
			type: 'color',
			default: 'white',
			optional: 'no',
		},
		{
			name: 'threshold',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.18,
			optional: 'no',
		},
	],
};

export const effectsGlowDemo: DemoType = {
	comp: EffectsGlowPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-glow',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'radius',
			type: 'numeric',
			min: 0,
			max: 100,
			step: 1,
			default: 28,
			optional: 'no',
		},
		{
			name: 'intensity',
			type: 'numeric',
			min: 0,
			max: 5,
			step: 0.1,
			default: 1.8,
			optional: 'no',
		},
		{
			name: 'threshold',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.25,
			optional: 'no',
		},
		{
			name: 'color',
			type: 'color',
			default: '#00d8ff',
			optional: 'no',
		},
	],
};

export const effectsHueDemo: DemoType = {
	comp: EffectsHuePreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-hue',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'degrees',
			type: 'numeric',
			min: 0,
			max: 360,
			step: 1,
			default: 120,
			optional: 'no',
		},
	],
};

export const effectsInvertDemo: DemoType = {
	comp: EffectsInvertPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-invert',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'amount',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 1,
			optional: 'no',
		},
	],
};

export const effectsSaturationDemo: DemoType = {
	comp: EffectsSaturationPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-saturation',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'amount',
			type: 'numeric',
			min: 0,
			max: 5,
			step: 0.1,
			default: 1.8,
			optional: 'no',
		},
	],
};

export const effectsTintDemo: DemoType = {
	comp: EffectsTintPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-tint',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'color',
			type: 'color',
			default: '#1ec8ff',
			optional: 'no',
		},
		{
			name: 'amount',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.7,
			optional: 'no',
		},
	],
};

export const effectsShineDemo: DemoType = {
	comp: EffectsShinePreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-shine',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'progress',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.5,
			optional: 'no',
		},
		{
			name: 'angle',
			type: 'numeric',
			min: -180,
			max: 180,
			step: 1,
			default: 30,
			optional: 'no',
		},
		{
			name: 'haloSigma',
			type: 'numeric',
			min: 1,
			max: 500,
			step: 1,
			default: 200,
			optional: 'no',
		},
		{
			name: 'coreSigma',
			type: 'numeric',
			min: 1,
			max: 500,
			step: 1,
			default: 65,
			optional: 'no',
		},
		{
			name: 'haloIntensity',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.3,
			optional: 'no',
		},
		{
			name: 'coreIntensity',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.4,
			optional: 'no',
		},
	],
};

export const effectsMirrorDemo: DemoType = {
	comp: EffectsMirrorPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-mirror',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'direction',
			type: 'enum',
			values: ['horizontal', 'vertical'],
			default: 'horizontal',
			optional: 'no',
		},
		{
			name: 'position',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.5,
			optional: 'no',
		},
		{
			name: 'invert',
			type: 'boolean',
			default: false,
			optional: 'no',
		},
	],
};

export const effectsScaleDemo: DemoType = {
	comp: EffectsScalePreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-scale',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'scale',
			type: 'numeric',
			min: 0.1,
			max: 3,
			step: 0.05,
			default: 0.8,
			optional: 'no',
		},
		{
			name: 'horizontal',
			type: 'boolean',
			default: true,
			optional: 'no',
		},
		{
			name: 'vertical',
			type: 'boolean',
			default: true,
			optional: 'no',
		},
	],
};

export const effectsXyTranslateDemo: DemoType = {
	comp: EffectsXyTranslatePreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-xy-translate',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'x',
			type: 'numeric',
			min: -640,
			max: 640,
			step: 1,
			default: 180,
			optional: 'no',
		},
		{
			name: 'y',
			type: 'numeric',
			min: -360,
			max: 360,
			step: 1,
			default: 90,
			optional: 'no',
		},
	],
};

export const effectsUvTranslateDemo: DemoType = {
	comp: EffectsUvTranslatePreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-uv-translate',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'u',
			type: 'numeric',
			min: -1,
			max: 1,
			step: 0.01,
			default: 0.15,
			optional: 'no',
		},
		{
			name: 'v',
			type: 'numeric',
			min: -1,
			max: 1,
			step: 0.01,
			default: 0.125,
			optional: 'no',
		},
	],
};

export const effectsBarrelDistortionDemo: DemoType = {
	comp: EffectsBarrelDistortionPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-barrel-distortion',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'amount',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.28,
			optional: 'no',
		},
	],
};

export const effectsVignetteDemo: DemoType = {
	comp: EffectsVignettePreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-vignette',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'amount',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.75,
			optional: 'no',
		},
		{
			name: 'radius',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.55,
			optional: 'no',
		},
		{
			name: 'feather',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 0.35,
			optional: 'no',
		},
		{
			name: 'roundness',
			type: 'numeric',
			min: 0,
			max: 1,
			step: 0.01,
			default: 1,
			optional: 'no',
		},
		{
			name: 'mode',
			type: 'enum',
			values: ['color', 'alpha'],
			default: 'color',
			optional: 'no',
		},
		{
			name: 'color',
			type: 'color',
			default: '#000000',
			optional: 'no',
			showIf: {
				option: 'mode',
				value: 'color',
			},
		},
	],
};

export const effectsBlurDemo: DemoType = {
	comp: EffectsBlurPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-blur',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'radius',
			type: 'numeric',
			min: 0,
			max: 100,
			step: 1,
			default: 40,
			optional: 'no',
		},
		{
			name: 'horizontal',
			type: 'boolean',
			default: true,
			optional: 'no',
		},
		{
			name: 'vertical',
			type: 'boolean',
			default: true,
			optional: 'no',
		},
	],
};

export const effectsChromaticAberrationDemo: DemoType = {
	comp: EffectsChromaticAberrationPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-chromatic-aberration',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'amount',
			type: 'numeric',
			min: 0,
			max: 100,
			step: 1,
			default: 12,
			optional: 'no',
		},
		{
			name: 'angle',
			type: 'numeric',
			min: 0,
			max: 360,
			step: 1,
			default: 0,
			optional: 'no',
		},
	],
};

export const effectsWaveDemo: DemoType = {
	comp: EffectsWavePreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-wave',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'phase',
			type: 'numeric',
			min: 0,
			max: 6.28,
			step: 0.01,
			default: 1.2,
			optional: 'no',
		},
		{
			name: 'amplitude',
			type: 'numeric',
			min: 0,
			max: 200,
			step: 1,
			default: 50,
			optional: 'no',
		},
		{
			name: 'wavelength',
			type: 'numeric',
			min: 1,
			max: 1000,
			step: 1,
			default: 200,
			optional: 'no',
		},
		{
			name: 'direction',
			type: 'enum',
			values: ['horizontal', 'vertical'],
			default: 'horizontal',
			optional: 'no',
		},
	],
};

export const effectsHalftoneDemo: DemoType = {
	comp: EffectsHalftonePreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-halftone',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'shape',
			type: 'enum',
			values: ['circle', 'square', 'line'],
			default: 'circle',
			optional: 'no',
		},
		{
			name: 'dotSize',
			type: 'numeric',
			min: 1,
			max: 50,
			step: 1,
			default: 8,
			optional: 'no',
		},
		{
			name: 'dotSpacing',
			type: 'numeric',
			min: 1,
			max: 50,
			step: 1,
			default: 7,
			optional: 'no',
		},
		{
			name: 'rotation',
			type: 'numeric',
			min: -180,
			max: 180,
			step: 1,
			default: 12,
			optional: 'no',
		},
		{
			name: 'colorMode',
			type: 'enum',
			values: ['solid', 'source'],
			default: 'solid',
			optional: 'no',
		},
		{
			name: 'dotColor',
			type: 'color',
			default: '#ff0000',
			optional: 'no',
			showIf: {
				option: 'colorMode',
				value: 'solid',
			},
		},
		{
			name: 'invert',
			type: 'boolean',
			default: false,
			optional: 'no',
		},
	],
};

export const effectsHalftoneLinearGradientDemo: DemoType = {
	comp: EffectsHalftoneLinearGradientPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-halftone-linear-gradient',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'firstStopDotSize',
			type: 'numeric',
			min: 0,
			max: 80,
			step: 1,
			default: 0,
			optional: 'no',
		},
		{
			name: 'secondStopDotSize',
			type: 'numeric',
			min: 0,
			max: 80,
			step: 1,
			default: 40,
			optional: 'no',
		},
		{
			name: 'firstStopPosition',
			type: 'uv-coordinate',
			min: -1,
			max: 2,
			step: 0.01,
			default: [0, 0.5],
			optional: 'no',
		},
		{
			name: 'secondStopPosition',
			type: 'uv-coordinate',
			min: -1,
			max: 2,
			step: 0.01,
			default: [1, 0.5],
			optional: 'no',
		},
		{
			name: 'gridSize',
			type: 'numeric',
			min: 1,
			max: 80,
			step: 1,
			default: 24,
			optional: 'no',
		},
		{
			name: 'colorMode',
			type: 'enum',
			values: ['solid', 'source'],
			default: 'solid',
			optional: 'no',
		},
		{
			name: 'dotColor',
			type: 'color',
			default: '#0b84f3',
			optional: 'no',
			showIf: {
				option: 'colorMode',
				value: 'solid',
			},
		},
	],
};

export const effectsStarburstDemo: DemoType = {
	comp: EffectsStarburstPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-starburst',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
	options: [
		{
			name: 'rays',
			type: 'numeric',
			default: 16,
			min: 2,
			max: 100,
			step: 1,
			optional: 'no',
		},
		{
			name: 'rotation',
			type: 'numeric',
			default: 0,
			min: 0,
			max: 360,
			step: 1,
			optional: 'no',
		},
		{
			name: 'smoothness',
			type: 'numeric',
			default: 0,
			min: 0,
			max: 1,
			step: 0.01,
			optional: 'no',
		},
		{
			name: 'originOffsetX',
			type: 'numeric',
			default: 0,
			min: -1,
			max: 1,
			step: 0.01,
			optional: 'no',
		},
		{
			name: 'originOffsetY',
			type: 'numeric',
			default: 0,
			min: -1,
			max: 1,
			step: 0.01,
			optional: 'no',
		},
	],
};

export const effectsLightLeakDemo: DemoType = {
	comp: EffectsLightLeakPreview,
	compHeight: 720,
	compWidth: 1280,
	durationInFrames: 1,
	fps: 30,
	id: 'effects-light-leak',
	autoPlay: false,
	controls: false,
	logLevel: 'info',
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
		{
			name: 'progress',
			type: 'numeric',
			default: 0.5,
			min: 0,
			max: 1,
			step: 0.01,
			optional: 'no',
		},
	],
};

export const htmlInCanvasDemoWebGL: DemoType = {
	comp: HtmlInCanvasDocsDemoWebGL,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 120,
	fps: 30,
	id: 'html-in-canvas-webgl',
	autoPlay: true,
	controls: true,
	logLevel: 'info',
	options: [],
};

export const htmlInCanvasDemoWebGPU: DemoType = {
	comp: HtmlInCanvasDocsDemoWebGPU,
	compHeight: 1080,
	compWidth: 1920,
	durationInFrames: 120,
	fps: 30,
	id: 'html-in-canvas-webgpu',
	autoPlay: true,
	controls: true,
	logLevel: 'trace',
	options: [],
};
