import React, {useCallback, useRef} from 'react';
import {
	AbsoluteFillElement,
	type AbsoluteFillElementProps,
} from './AbsoluteFillElement.js';
import type {SequenceControls} from './CompositionManager.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import type {InteractiveBaseProps} from './Interactive.js';
import {
	backgroundSchema,
	baseSchema,
	borderRadiusSchema,
	borderSchema,
	textContentSchema,
	textSchema,
	transformSchema,
	type InteractivitySchema,
} from './interactivity-schema.js';
import {Sequence} from './Sequence.js';
import {useUnsafeVideoConfig} from './use-unsafe-video-config.js';
import {withInteractivitySchema} from './with-interactivity-schema.js';

export type AbsoluteFillProps = Omit<
	AbsoluteFillElementProps,
	keyof InteractiveBaseProps
> &
	InteractiveBaseProps & {
		/**
		 * @deprecated For internal use only
		 */
		readonly stack?: string;
	};

export const absoluteFillSchema = {
	...baseSchema,
	...transformSchema,
	...backgroundSchema,
	...borderSchema,
	...borderRadiusSchema,
	...textSchema,
	...textContentSchema,
} as const satisfies InteractivitySchema;

const setRef = <ElementType,>(
	ref: React.Ref<ElementType> | undefined,
	value: ElementType | null,
) => {
	if (typeof ref === 'function') {
		ref(value);
	} else if (ref) {
		ref.current = value;
	}
};

const AbsoluteFillInner: React.FC<
	AbsoluteFillProps & {readonly controls: SequenceControls | undefined}
> = ({
	ref,
	from,
	trimBefore,
	freeze,
	durationInFrames,
	hidden,
	name,
	showInTimeline,
	stack,
	controls,
	children,
	...divProps
}) => {
	const videoConfig = useUnsafeVideoConfig();
	const refForOutline = useRef<HTMLDivElement | null>(null);
	const callbackRef = useCallback(
		(element: HTMLDivElement | null) => {
			refForOutline.current = element;
			setRef(ref, element);
		},
		[ref],
	);

	if (videoConfig === null) {
		return hidden ? null : (
			<AbsoluteFillElement ref={callbackRef} {...divProps}>
				{children}
			</AbsoluteFillElement>
		);
	}

	return (
		<Sequence
			layout="none"
			from={from ?? 0}
			trimBefore={trimBefore}
			freeze={freeze}
			durationInFrames={durationInFrames ?? Infinity}
			hidden={hidden}
			name={name ?? '<AbsoluteFill>'}
			showInTimeline={showInTimeline ?? true}
			controls={controls}
			_remotionInternalStack={stack}
			_remotionInternalDocumentationLink="https://www.remotion.dev/docs/absolute-fill"
			outlineRef={refForOutline}
		>
			<AbsoluteFillElement ref={callbackRef} {...divProps}>
				{children}
			</AbsoluteFillElement>
		</Sequence>
	);
};

/*
 * @description A helper component which renders an absolutely positioned <div> element with full width, height, and flex display suited for content layering.
 * @see [Documentation](https://remotion.dev/docs/absolute-fill)
 */

export const AbsoluteFill = withInteractivitySchema({
	Component: AbsoluteFillInner,
	componentName: '<AbsoluteFill>',
	componentIdentity: 'dev.remotion.remotion.AbsoluteFill',
	schema: absoluteFillSchema,
	supportsEffects: false,
});

addSequenceStackTraces(AbsoluteFill);
