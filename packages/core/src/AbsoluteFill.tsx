import React, {forwardRef} from 'react';
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
	borderRadiusSchema,
	borderSchema,
	childrenSchema,
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
	...transformSchema,
	...backgroundSchema,
	...borderSchema,
	...borderRadiusSchema,
	...textSchema,
	...childrenSchema,
} as const satisfies InteractivitySchema;

type AbsoluteFillInnerProps = Omit<AbsoluteFillProps, 'ref'> & {
	readonly controls: SequenceControls | undefined;
};

const AbsoluteFillWithTiming: React.FC<
	AbsoluteFillInnerProps & {
		readonly elementRef: React.Ref<HTMLDivElement>;
	}
> = ({
	elementRef,
	from,
	premountFor,
	postmountFor,
	styleWhilePremounted,
	styleWhilePostmounted,
	trimBefore,
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
		<Freeze
			frame={freezeFrame}
			active={isPremountingOrPostmounting}
			_remotionInternalIsPremounting={premountingActive}
		>
			<Sequence
				layout="none"
				from={from ?? 0}
				trimBefore={trimBefore}
				playbackRate={playbackRate}
				loop={loop}
				freeze={freeze}
				durationInFrames={durationInFrames}
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
					ref={elementRef}
					{...divProps}
					style={premountingStyle ?? undefined}
				>
					{children}
				</AbsoluteFillElement>
			</Sequence>
		</Freeze>
	);
};

const AbsoluteFillInner = forwardRef<HTMLDivElement, AbsoluteFillInnerProps>(
	(props, ref) => {
		const videoConfig = useUnsafeVideoConfig();
		if (videoConfig !== null) {
			return <AbsoluteFillWithTiming {...props} elementRef={ref} />;
		}

		const {
			from,
			premountFor,
			postmountFor,
			styleWhilePremounted,
			styleWhilePostmounted,
			trimBefore,
			playbackRate,
			loop,
			freeze,
			durationInFrames,
			hidden,
			name,
			showInTimeline,
			stack,
			controls,
			...divProps
		} = props;
		return hidden ? null : <AbsoluteFillElement {...divProps} ref={ref} />;
	},
);
AbsoluteFillInner.displayName = 'AbsoluteFillInner';

/*
 * @description A helper component which renders an absolutely positioned <div> element with full width, height, and flex display suited for content layering.
 * @see [Documentation](https://remotion.dev/docs/absolute-fill)
 */

export const AbsoluteFill = withInteractivitySchema<
	typeof absoluteFillSchema,
	AbsoluteFillProps
>({
	Component: AbsoluteFillInner,
	componentName: '<AbsoluteFill>',
	componentIdentity: 'dev.remotion.remotion.AbsoluteFill',
	schema: absoluteFillSchema,
	supportsEffects: false,
});

addSequenceStackTraces(AbsoluteFill);
