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
import type {AnnotationConfig, RoughAnnotationOptions} from './types';

type AnnotationComponentProps = Readonly<
	{
		children: React.ReactNode;
		progress: number;
		seed?: number;
		style?: React.CSSProperties;
	} & AnnotationConfig &
		RoughAnnotationOptions
>;

type AnnotationInteractiveProps = AnnotationComponentProps &
	InteractiveBaseProps;

const colorSchema = {
	color: {
		type: 'color',
		default: 'currentColor',
		description: 'Color',
	},
} as const satisfies InteractivitySchema;

const strokeWidthSchema = {
	strokeWidth: {
		type: 'number',
		min: 0,
		step: 1,
		default: 20,
		description: 'Stroke Width',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const iterationsSchema = {
	iterations: {
		type: 'number',
		min: 1,
		step: 1,
		default: 2,
		description: 'Iterations',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const rtlSchema = {
	rtl: {
		type: 'boolean',
		default: false,
		description: 'Right-to-left',
	},
} as const satisfies InteractivitySchema;

const roughJsControlsSchema = {
	roughness: {
		type: 'number',
		min: 0,
		step: 0.1,
		default: 1.5,
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
} as const satisfies InteractivitySchema;

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

export const annotationInteractiveSchema: InteractivitySchema = {
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
	seed: {
		type: 'number',
		step: 1,
		default: 1,
		description: 'Seed',
		hiddenFromList: false,
	},
	...roughJsControlsSchema,
	...colorSchema,
	...Interactive.textSchema,
	...textContentSchema,
	...strokeWidthSchema,
	...iterationsSchema,
	...rtlSchema,
	type: {
		type: 'enum',
		default: 'underline',
		description: 'Type',
		keyframable: false,
		variants: {
			none: {},
			underline: {
				...underlinePaddingSchema,
			},
			'strike-through': {},
			box: {
				...paddingSchema,
			},
			bracket: {
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
			},
			'crossed-off': {},
			circle: {
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
			},
			highlight: {
				...paddingSchema,
			},
		},
	},
};

const AnnotationOnTopInner: React.FC<
	AnnotationInteractiveProps & {
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
	...props
}) => {
	const annotation = useMemo(() => {
		return createAnnotation();
	}, []);
	const outlineRef = React.useRef<HTMLSpanElement | null>(null);

	return (
		<Sequence
			layout="none"
			from={from ?? 0}
			trimBefore={trimBefore}
			durationInFrames={durationInFrames ?? Infinity}
			freeze={freeze}
			hidden={hidden}
			name={name ?? '<AnnotationOnTop>'}
			showInTimeline={showInTimeline ?? true}
			controls={controls}
			_remotionInternalStack={stack}
			_remotionInternalDocumentationLink="https://www.remotion.dev/docs/rough-notation/annotation-on-top"
			outlineRef={outlineRef}
		>
			<span ref={outlineRef} style={{display: 'inline-block'}}>
				<annotation.Container>
					<annotation.Tracker style={style}>{children}</annotation.Tracker>
					<annotation.Annotation {...props} />
				</annotation.Container>
			</span>
		</Sequence>
	);
};

export const AnnotationOnTop = Interactive.withSchema({
	Component: AnnotationOnTopInner,
	componentName: '<AnnotationOnTop>',
	componentIdentity: Interactive._internalMakeRemotionComponentIdentity({
		packageName: '@remotion/rough-notation',
		componentName: 'AnnotationOnTop',
	}),
	schema: annotationInteractiveSchema,
	supportsEffects: false,
}) as React.FC<AnnotationInteractiveProps>;

AnnotationOnTop.displayName = 'AnnotationOnTop';
Internals.addSequenceStackTraces(AnnotationOnTop);

const AnnotationBehindInner: React.FC<
	AnnotationInteractiveProps & {
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
	...props
}) => {
	const annotation = useMemo(() => {
		return createAnnotation();
	}, []);
	const outlineRef = React.useRef<HTMLSpanElement | null>(null);

	return (
		<Sequence
			layout="none"
			from={from ?? 0}
			trimBefore={trimBefore}
			durationInFrames={durationInFrames ?? Infinity}
			freeze={freeze}
			hidden={hidden}
			name={name ?? '<AnnotationBehind>'}
			showInTimeline={showInTimeline ?? true}
			controls={controls}
			_remotionInternalStack={stack}
			_remotionInternalDocumentationLink="https://www.remotion.dev/docs/rough-notation/annotation-behind"
			outlineRef={outlineRef}
		>
			<span ref={outlineRef} style={{display: 'inline-block'}}>
				<annotation.Container>
					<annotation.Annotation {...props} />
					<annotation.Tracker style={style}>{children}</annotation.Tracker>
				</annotation.Container>
			</span>
		</Sequence>
	);
};

export const AnnotationBehind = Interactive.withSchema({
	Component: AnnotationBehindInner,
	componentName: '<AnnotationBehind>',
	componentIdentity: Interactive._internalMakeRemotionComponentIdentity({
		packageName: '@remotion/rough-notation',
		componentName: 'AnnotationBehind',
	}),
	schema: annotationInteractiveSchema,
	supportsEffects: false,
}) as React.FC<AnnotationInteractiveProps>;

AnnotationBehind.displayName = 'AnnotationBehind';
Internals.addSequenceStackTraces(AnnotationBehind);
