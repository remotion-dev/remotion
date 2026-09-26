import React, {useCallback} from 'react';
import {
	AbsoluteFillElement,
	type AbsoluteFillElementProps,
} from './AbsoluteFillElement.js';
import type {SequenceControls} from './CompositionManager.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {Freeze} from './freeze.js';
import type {
	InteractiveBaseProps,
	InteractivePremountProps,
} from './Interactive.js';
import {
	backgroundSchema,
	baseSchema,
	premountSchema,
	borderRadiusSchema,
	borderSchema,
	textContentSchema,
	textSchema,
	transformSchema,
	type InteractivitySchema,
} from './interactivity-schema.js';
import {resolveSequenceDuration} from './resolve-sequence-duration.js';
import {Sequence} from './Sequence.js';
import {usePremounting} from './use-premounting.js';
import {useUnsafeVideoConfig} from './use-unsafe-video-config.js';
import {withInteractivitySchema} from './with-interactivity-schema.js';

export type AbsoluteFillProps = Omit<
	AbsoluteFillElementProps,
	keyof InteractiveBaseProps
> &
	InteractiveBaseProps &
	InteractivePremountProps & {
		/**
		 * @deprecated For internal use only
		 */
		readonly stack?: string;
	};

export const absoluteFillSchema = {
	...baseSchema,
	...premountSchema,
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

const AbsoluteFillWithTiming: React.FC<
	AbsoluteFillProps & {
		readonly controls: SequenceControls | undefined;
	}
> = ({
	ref: callbackRef,
	from,
	premountFor,
	postmountFor,
	styleWhilePremounted,
	styleWhilePostmounted,
	trimBefore,
	trimAfter,
	playbackRate,
	loop,
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
	const {
		effectivePremountFor,
		effectivePostmountFor,
		freezeFrame,
		isPremountingOrPostmounting,
		premountingActive,
		postmountingActive,
		premountingStyle,
	} = usePremounting({
		from: from ?? 0,
		durationInFrames: resolveSequenceDuration({
			durationInFrames,
			trimBefore,
			trimAfter,
			playbackRate,
			loop,
		}),
		premountFor: premountFor ?? null,
		postmountFor: postmountFor ?? null,
		style: divProps.style ?? null,
		styleWhilePremounted: styleWhilePremounted ?? null,
		styleWhilePostmounted: styleWhilePostmounted ?? null,
		hideWhilePremounted: 'opacity',
	});
	return (
		<Freeze frame={freezeFrame} active={isPremountingOrPostmounting}>
			<Sequence
				layout="none"
				from={from ?? 0}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
				playbackRate={playbackRate}
				loop={loop}
				freeze={freeze}
				durationInFrames={durationInFrames ?? Infinity}
				hidden={hidden}
				name={name ?? '<AbsoluteFill>'}
				showInTimeline={showInTimeline ?? true}
				controls={controls}
				_remotionInternalStack={stack}
				_remotionInternalDocumentationLink="https://www.remotion.dev/docs/absolute-fill"
				_remotionInternalPremountDisplay={effectivePremountFor || null}
				_remotionInternalPostmountDisplay={effectivePostmountFor || null}
				_remotionInternalIsPremounting={premountingActive}
				_remotionInternalIsPostmounting={postmountingActive}
			>
				<AbsoluteFillElement
					ref={callbackRef}
					{...divProps}
					style={premountingStyle ?? undefined}
				>
					{children}
				</AbsoluteFillElement>
			</Sequence>
		</Freeze>
	);
};

const AbsoluteFillInner: React.FC<
	AbsoluteFillProps & {readonly controls: SequenceControls | undefined}
> = ({
	ref,
	from,
	premountFor,
	postmountFor,
	styleWhilePremounted,
	styleWhilePostmounted,
	trimBefore,
	trimAfter,
	playbackRate,
	loop,
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
	const callbackRef = useCallback(
		(element: HTMLDivElement | null) => {
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
		<AbsoluteFillWithTiming
			{...divProps}
			ref={callbackRef}
			from={from}
			premountFor={premountFor}
			postmountFor={postmountFor}
			styleWhilePremounted={styleWhilePremounted}
			styleWhilePostmounted={styleWhilePostmounted}
			trimBefore={trimBefore}
			trimAfter={trimAfter}
			playbackRate={playbackRate}
			loop={loop}
			freeze={freeze}
			durationInFrames={durationInFrames}
			hidden={hidden}
			name={name}
			showInTimeline={showInTimeline}
			stack={stack}
			controls={controls}
		>
			{children}
		</AbsoluteFillWithTiming>
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
