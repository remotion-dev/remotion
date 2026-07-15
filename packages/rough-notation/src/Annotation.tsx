import React, {useMemo} from 'react';
import {
	Internals,
	Interactive,
	Sequence,
	type InteractiveBaseProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';
import {createAnnotation} from './create-annotation';
import type {
	AnnotationConfig,
	Box as BoxMode,
	BoxConfig,
	BracketAnnotationConfig,
	CircleConfig,
	CrossedOffConfig,
	CurveAnnotationOptions,
	HighlightConfig,
	Padding,
	SharedRoughAnnotationOptions,
	StrikeThroughConfig,
	UnderlineConfig,
} from './types';

type SharedAnnotationComponentProps = Readonly<
	{
		readonly children: React.ReactNode;
		readonly progress: number;
		readonly seed?: number;
		readonly disabled?: boolean;
		readonly style?: React.CSSProperties;
	} & SharedRoughAnnotationOptions
>;

type AnnotationInteractiveProps<Config> = SharedAnnotationComponentProps &
	Readonly<Config> &
	InteractiveBaseProps;

export type HighlightProps = AnnotationInteractiveProps<HighlightConfig>;
export type UnderlineProps = AnnotationInteractiveProps<UnderlineConfig>;
export type StrikeThroughProps =
	AnnotationInteractiveProps<StrikeThroughConfig>;
export type CrossedOffProps = AnnotationInteractiveProps<CrossedOffConfig>;
export type BoxProps = AnnotationInteractiveProps<BoxConfig>;
export type BracketProps = AnnotationInteractiveProps<BracketAnnotationConfig>;
export type CircleProps = AnnotationInteractiveProps<
	CircleConfig & CurveAnnotationOptions
>;

type InternalAnnotationProps = SharedAnnotationComponentProps &
	InteractiveBaseProps & {
		readonly color?: string;
		readonly strokeWidth?: number;
		readonly padding?: Partial<Padding>;
		readonly iterations?: number;
		readonly rtl?: boolean;
		readonly box?: BoxMode;
		readonly bracketLeft?: boolean;
		readonly bracketRight?: boolean;
		readonly bracketTop?: boolean;
		readonly bracketBottom?: boolean;
	} & CurveAnnotationOptions;

const colorSchema = {
	color: {
		type: 'color',
		default: 'currentColor',
		description: 'Color',
	},
} as const satisfies InteractivitySchema;

const strokeWidthSchema = (defaultValue: number): InteractivitySchema => ({
	strokeWidth: {
		type: 'number',
		min: 0,
		step: 1,
		default: defaultValue,
		description: 'Stroke Width',
		hiddenFromList: false,
	},
});

const iterationsSchema = (defaultValue: number): InteractivitySchema => ({
	iterations: {
		type: 'number',
		min: 1,
		step: 1,
		default: defaultValue,
		description: 'Iterations',
		hiddenFromList: false,
	},
});

const rtlSchema = {
	rtl: {
		type: 'boolean',
		default: false,
		description: 'Right-to-left',
	},
} as const satisfies InteractivitySchema;

const roughJsControlsSchema = (
	defaultRoughness: number,
): InteractivitySchema => ({
	roughness: {
		type: 'number',
		min: 0,
		step: 0.1,
		default: defaultRoughness,
		description: 'Roughness',
		hiddenFromList: false,
	},
	maxRandomnessOffset: {
		type: 'number',
		min: 0,
		step: 0.1,
		default: 5,
		description: 'Max Randomness Offset',
		hiddenFromList: false,
	},
	bowing: {
		type: 'number',
		min: 0,
		step: 0.1,
		default: 1,
		description: 'Bowing',
		hiddenFromList: false,
	},
	disableMultiStroke: {
		type: 'boolean',
		default: false,
		description: 'Disable Multi Stroke',
	},
	preserveVertices: {
		type: 'boolean',
		default: false,
		description: 'Preserve Vertices',
	},
});

const curveControlsSchema = {
	curveFitting: {
		type: 'number',
		min: 0,
		step: 0.01,
		default: 0.95,
		description: 'Curve Fitting',
		hiddenFromList: false,
	},
	curveTightness: {
		type: 'number',
		step: 0.1,
		default: 0,
		description: 'Curve Tightness',
		hiddenFromList: false,
	},
	curveStepCount: {
		type: 'number',
		min: 1,
		step: 1,
		default: 9,
		description: 'Curve Step Count',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const paddingSchema = {
	'padding.left': {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Left Padding',
		hiddenFromList: false,
	},
	'padding.right': {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Right Padding',
		hiddenFromList: false,
	},
	'padding.top': {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Top Padding',
		hiddenFromList: false,
	},
	'padding.bottom': {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Bottom Padding',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const underlinePaddingSchema = {
	'padding.top': paddingSchema['padding.top'],
} as const satisfies InteractivitySchema;

const textContentSchema = {
	children: {
		type: 'text-content',
		default: '',
		description: 'Text',
		keyframable: false,
	},
} as const satisfies InteractivitySchema;

const sharedSchema = (defaultRoughness: number): InteractivitySchema => ({
	...Interactive.baseSchema,
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Progress',
		hiddenFromList: false,
	},
	disabled: {
		type: 'boolean',
		default: false,
		description: 'Disabled',
	},
	seed: {
		type: 'number',
		step: 1,
		default: 1,
		description: 'Seed',
		hiddenFromList: false,
	},
	...roughJsControlsSchema(defaultRoughness),
	...colorSchema,
	...Interactive.textSchema,
	...textContentSchema,
});

export const highlightSchema: InteractivitySchema = {
	...sharedSchema(3),
	...iterationsSchema(2),
	...rtlSchema,
	...paddingSchema,
};

export const underlineSchema: InteractivitySchema = {
	...sharedSchema(1.5),
	...strokeWidthSchema(20),
	...iterationsSchema(2),
	...rtlSchema,
	...underlinePaddingSchema,
};

export const strikeThroughSchema: InteractivitySchema = {
	...sharedSchema(1.5),
	...strokeWidthSchema(20),
	...iterationsSchema(1),
	...rtlSchema,
};

export const crossedOffSchema: InteractivitySchema = {
	...sharedSchema(1.5),
	...strokeWidthSchema(20),
	...iterationsSchema(1),
	...rtlSchema,
};

export const boxSchema: InteractivitySchema = {
	...sharedSchema(1.5),
	...strokeWidthSchema(7),
	...iterationsSchema(2),
	...paddingSchema,
};

export const bracketSchema: InteractivitySchema = {
	...sharedSchema(1.5),
	...strokeWidthSchema(20),
	...paddingSchema,
	bracketLeft: {
		type: 'boolean',
		default: false,
		description: 'Left Bracket',
	},
	bracketRight: {
		type: 'boolean',
		default: true,
		description: 'Right Bracket',
	},
	bracketTop: {
		type: 'boolean',
		default: false,
		description: 'Top Bracket',
	},
	bracketBottom: {
		type: 'boolean',
		default: false,
		description: 'Bottom Bracket',
	},
};

export const circleSchema: InteractivitySchema = {
	...sharedSchema(1.5),
	...strokeWidthSchema(20),
	...iterationsSchema(2),
	...paddingSchema,
	...curveControlsSchema,
	box: {
		type: 'enum',
		default: 'around',
		description: 'Box',
		keyframable: false,
		variants: {
			inside: {},
			around: {},
		},
	},
};

const annotationSchemas = [
	highlightSchema,
	underlineSchema,
	strikeThroughSchema,
	crossedOffSchema,
	boxSchema,
	bracketSchema,
	circleSchema,
];

export {annotationSchemas};

type AnnotationStyle = Exclude<AnnotationConfig['type'], 'none'>;
type Layer = 'behind' | 'on-top';

const makeAnnotationComponent = ({
	type,
	componentName,
	documentationSlug,
	layer,
	schema,
}: {
	readonly type: AnnotationStyle;
	readonly componentName: string;
	readonly documentationSlug: string;
	readonly layer: Layer;
	readonly schema: InteractivitySchema;
}): React.FC<InternalAnnotationProps> => {
	const AnnotationInner: React.FC<
		InternalAnnotationProps & {
			readonly controls: SequenceControls | undefined;
			readonly stack?: string;
		}
	> = ({
		children,
		durationInFrames,
		from,
		trimBefore,
		freeze,
		hidden,
		name,
		showInTimeline,
		controls,
		stack,
		style,
		progress,
		seed,
		disabled,
		roughness,
		maxRandomnessOffset,
		bowing,
		curveFitting,
		curveTightness,
		curveStepCount,
		disableMultiStroke,
		preserveVertices,
		...configProps
	}) => {
		const annotation = useMemo(() => {
			return createAnnotation();
		}, []);
		const outlineRef = React.useRef<HTMLSpanElement | null>(null);
		const config = (
			disabled ? {type: 'none'} : {...configProps, type}
		) as AnnotationConfig;
		const annotationElement = (
			<annotation.Annotation
				{...config}
				progress={progress}
				seed={seed}
				roughness={roughness}
				maxRandomnessOffset={maxRandomnessOffset}
				bowing={bowing}
				curveFitting={curveFitting}
				curveTightness={curveTightness}
				curveStepCount={curveStepCount}
				disableMultiStroke={disableMultiStroke}
				preserveVertices={preserveVertices}
			/>
		);

		return (
			<Sequence
				layout="none"
				from={from ?? 0}
				trimBefore={trimBefore}
				durationInFrames={durationInFrames ?? Infinity}
				freeze={freeze}
				hidden={hidden}
				name={name ?? `<${componentName}>`}
				showInTimeline={showInTimeline ?? true}
				controls={controls}
				_remotionInternalStack={stack}
				_remotionInternalDocumentationLink={`https://www.remotion.dev/docs/rough-notation/${documentationSlug}`}
				outlineRef={outlineRef}
			>
				<span ref={outlineRef} style={{display: 'inline-block'}}>
					<annotation.Container>
						{layer === 'behind' ? annotationElement : null}
						<annotation.Tracker style={style}>{children}</annotation.Tracker>
						{layer === 'on-top' ? annotationElement : null}
					</annotation.Container>
				</span>
			</Sequence>
		);
	};

	const Component = Interactive.withSchema({
		Component: AnnotationInner,
		componentName: `<${componentName}>`,
		componentIdentity: Interactive._internalMakeRemotionComponentIdentity({
			packageName: '@remotion/rough-notation',
			componentName,
		}),
		schema,
		supportsEffects: false,
	}) as React.FC<InternalAnnotationProps>;

	Component.displayName = componentName;
	Internals.addSequenceStackTraces(Component);
	return Component;
};

export const Highlight = makeAnnotationComponent({
	type: 'highlight',
	componentName: 'Highlight',
	documentationSlug: 'highlight',
	layer: 'behind',
	schema: highlightSchema,
}) as React.FC<HighlightProps>;

export const Underline = makeAnnotationComponent({
	type: 'underline',
	componentName: 'Underline',
	documentationSlug: 'underline',
	layer: 'on-top',
	schema: underlineSchema,
}) as React.FC<UnderlineProps>;

export const StrikeThrough = makeAnnotationComponent({
	type: 'strike-through',
	componentName: 'StrikeThrough',
	documentationSlug: 'strike-through',
	layer: 'on-top',
	schema: strikeThroughSchema,
}) as React.FC<StrikeThroughProps>;

export const CrossedOff = makeAnnotationComponent({
	type: 'crossed-off',
	componentName: 'CrossedOff',
	documentationSlug: 'crossed-off',
	layer: 'on-top',
	schema: crossedOffSchema,
}) as React.FC<CrossedOffProps>;

export const Box = makeAnnotationComponent({
	type: 'box',
	componentName: 'Box',
	documentationSlug: 'box',
	layer: 'on-top',
	schema: boxSchema,
}) as React.FC<BoxProps>;

export const Bracket = makeAnnotationComponent({
	type: 'bracket',
	componentName: 'Bracket',
	documentationSlug: 'bracket',
	layer: 'on-top',
	schema: bracketSchema,
}) as React.FC<BracketProps>;

export const Circle = makeAnnotationComponent({
	type: 'circle',
	componentName: 'Circle',
	documentationSlug: 'circle',
	layer: 'on-top',
	schema: circleSchema,
}) as React.FC<CircleProps>;
