import React, {useMemo} from 'react';
import {
	Interactive,
	Sequence,
	type InteractiveBaseProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';
import type {ResolvedOptions} from 'roughjs/bin/core';
import type {z} from 'zod';
import {createAnnotation} from './create-annotation';
import type {annotationConfig} from './types';

type AnnotationComponentProps = Readonly<
	{
		children: React.ReactNode;
		progress: number;
		seed?: number;
		roughOptions?: Partial<ResolvedOptions>;
	} & z.input<typeof annotationConfig>
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

const annotationInteractiveSchema = {
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
		keyframable: false,
	},
	...colorSchema,
	...strokeWidthSchema,
	...iterationsSchema,
	...rtlSchema,
	...paddingSchema,
	brackets: {
		type: 'array',
		item: {
			type: 'enum',
			variants: ['left', 'right', 'top', 'bottom'],
		},
		default: ['right'],
		newItemDefault: 'right',
		description: 'Brackets',
	},
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
	type: {
		type: 'enum',
		default: 'underline',
		description: 'Type',
		keyframable: false,
		variants: {
			underline: {},
			'strike-through': {},
			box: {},
			bracket: {},
			'crossed-off': {},
			circle: {},
			highlight: {},
		},
	},
} as const satisfies InteractivitySchema;

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
					<annotation.Tracker>{children}</annotation.Tracker>
					<annotation.Annotation {...props} />
				</annotation.Container>
			</span>
		</Sequence>
	);
};

export const AnnotationOnTop = Interactive.withSchema({
	Component: AnnotationOnTopInner,
	componentName: '<AnnotationOnTop>',
	componentIdentity: 'dev.remotion.rough-notation.AnnotationOnTop',
	schema: annotationInteractiveSchema,
	supportsEffects: false,
}) as React.FC<AnnotationInteractiveProps>;

AnnotationOnTop.displayName = 'AnnotationOnTop';

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
					<annotation.Tracker>{children}</annotation.Tracker>
				</annotation.Container>
			</span>
		</Sequence>
	);
};

export const AnnotationBehind = Interactive.withSchema({
	Component: AnnotationBehindInner,
	componentName: '<AnnotationBehind>',
	componentIdentity: 'dev.remotion.rough-notation.AnnotationBehind',
	schema: annotationInteractiveSchema,
	supportsEffects: false,
}) as React.FC<AnnotationInteractiveProps>;

AnnotationBehind.displayName = 'AnnotationBehind';
