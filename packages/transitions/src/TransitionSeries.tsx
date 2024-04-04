/* eslint-disable no-else-return */
import type {FC, PropsWithChildren} from 'react';
import {Children, useMemo} from 'react';
import type {
	LayoutAndStyle,
	PremountedSequenceProps,
	SequencePropsWithoutDuration,
} from 'remotion';
import {
	Internals,
	PremountedSequence,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {flattenChildren} from './flatten-children.js';
import {slide} from './presentations/slide.js';
import type {TransitionSeriesTransitionProps} from './types.js';
import {validateDurationInFrames} from './validate.js';

// eslint-disable-next-line react/function-component-definition
const TransitionSeriesTransition = function <
	PresentationProps extends Record<string, unknown>,
>(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_props: TransitionSeriesTransitionProps<PresentationProps>,
) {
	return null;
};

type TransitionSeriesSequenceProps = PropsWithChildren<
	{
		durationInFrames: number;
		offset?: number;
		className?: string;
		/**
		 * @deprecated For internal use only
		 */
		stack?: string;
	} & LayoutAndStyle &
		Pick<SequencePropsWithoutDuration, 'name'>
>;

type TransitionSeriesPremountedSequenceProps = PropsWithChildren<
	{
		durationInFrames: number;
		offset?: number;
		className?: string;
		/**
		 * @deprecated For internal use only
		 */
		stack?: string;
	} & LayoutAndStyle &
		Pick<PremountedSequenceProps, 'name' | 'premountFor'>
>;

const SeriesSequence = ({children}: TransitionSeriesSequenceProps) => {
	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
};

const PremountedSeriesSequence = ({
	children,
}: TransitionSeriesPremountedSequenceProps) => {
	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
};

type TransitionType<PresentationProps extends Record<string, unknown>> = {
	props: TransitionSeriesTransitionProps<PresentationProps>;
	type: typeof TransitionSeriesTransition;
};

type TypeChild<PresentationProps extends Record<string, unknown>> =
	| {
			props: TransitionSeriesSequenceProps;
			type: typeof SeriesSequence;
	  }
	| {
			props: TransitionSeriesPremountedSequenceProps;
			type: typeof PremountedSeriesSequence;
	  }
	| TransitionType<PresentationProps>
	| string;

const TransitionSeriesChildren: FC<{children: React.ReactNode}> = ({
	children,
}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const childrenValue = useMemo(() => {
		let transitionOffsets = 0;
		let startFrame = 0;
		const flattedChildren = flattenChildren(children);

		return Children.map(flattedChildren, (child, i) => {
			const current = child as unknown as TypeChild<Record<string, unknown>>;
			if (typeof current === 'string') {
				// Don't throw if it's just some accidential whitespace
				if (current.trim() === '') {
					return null;
				}

				throw new TypeError(
					// TODO
					`The <TransitionSeries /> component only accepts a list of <TransitionSeries.Sequence /> components as its children, but you passed a string "${current}"`,
				);
			}

			const hasPrev = flattedChildren[i - 1] as TypeChild<
				Record<string, unknown>
			>;
			const nextPrev = flattedChildren[i + 1] as TypeChild<
				Record<string, unknown>
			>;

			const prev: TransitionType<Record<string, unknown>> | null =
				typeof hasPrev === 'string' || typeof hasPrev === 'undefined'
					? null
					: hasPrev.type === TransitionSeriesTransition
						? (hasPrev as TransitionType<Record<string, unknown>>)
						: null;

			const next: TransitionType<Record<string, unknown>> | null =
				typeof nextPrev === 'string' || typeof nextPrev === 'undefined'
					? null
					: nextPrev.type === TransitionSeriesTransition
						? (nextPrev as TransitionType<Record<string, unknown>>)
						: null;

			const prevIsTransition =
				typeof hasPrev === 'string' || typeof hasPrev === 'undefined'
					? false
					: hasPrev.type === TransitionSeriesTransition;

			if (current.type === TransitionSeriesTransition) {
				if (prevIsTransition) {
					throw new TypeError(
						`A <TransitionSeries.Transition /> component must not be followed by another <TransitionSeries.Transition /> component (nth children = ${
							i - 1
						} and ${i})`,
					);
				}

				return null;
			}

			if (
				current.type !== SeriesSequence &&
				current.type !== PremountedSeriesSequence
			) {
				throw new TypeError(
					`The <TransitionSeries /> component only accepts a list of <TransitionSeries.Sequence />, <TransitionSeries.PremountedSequence /> and <TransitionSeries.Transition /> components as its children, but got ${current} instead`,
				);
			}

			const castedChildAgain = current as
				| {
						props: TransitionSeriesSequenceProps;
						type: typeof SeriesSequence;
				  }
				| {
						props: TransitionSeriesPremountedSequenceProps;
						type: typeof PremountedSeriesSequence;
				  };

			const debugInfo = `index = ${i}, duration = ${castedChildAgain.props.durationInFrames}`;

			if (!castedChildAgain?.props.children) {
				throw new TypeError(
					`A <TransitionSeries.Sequence /> component (${debugInfo}) was detected to not have any children. Delete it to fix this error.`,
				);
			}

			const durationInFramesProp = castedChildAgain.props.durationInFrames;

			validateDurationInFrames(durationInFramesProp, {
				component: `of a <TransitionSeries.Sequence /> component`,
				allowFloats: true,
			});
			const offset = castedChildAgain.props.offset ?? 0;
			if (Number.isNaN(offset)) {
				throw new TypeError(
					`The "offset" property of a <TransitionSeries.Sequence /> must not be NaN, but got NaN (${debugInfo}).`,
				);
			}

			if (!Number.isFinite(offset)) {
				throw new TypeError(
					`The "offset" property of a <TransitionSeries.Sequence /> must be finite, but got ${offset} (${debugInfo}).`,
				);
			}

			if (offset % 1 !== 0) {
				throw new TypeError(
					`The "offset" property of a <TransitionSeries.Sequence /> must be finite, but got ${offset} (${debugInfo}).`,
				);
			}

			const currentStartFrame = startFrame + offset;

			let duration = 0;

			if (prev) {
				duration = prev.props.timing.getDurationInFrames({
					fps,
				});
				transitionOffsets -= duration;
			}

			let actualStartFrame = currentStartFrame + transitionOffsets;

			startFrame += durationInFramesProp + offset;

			// Handle the case where the first item is a transition
			if (actualStartFrame < 0) {
				startFrame -= actualStartFrame;
				actualStartFrame = 0;
			}

			const nextProgress = next
				? next.props.timing.getProgress({
						frame:
							frame -
							actualStartFrame -
							durationInFramesProp +
							next.props.timing.getDurationInFrames({fps}),
						fps,
					})
				: null;

			const prevProgress = prev
				? prev.props.timing.getProgress({
						frame: frame - actualStartFrame,
						fps,
					})
				: null;

			if (
				next &&
				durationInFramesProp < next.props.timing.getDurationInFrames({fps})
			) {
				throw new Error(
					`The duration of a <TransitionSeries.Sequence /> must not be shorter than the duration of the next <TransitionSeries.Transition />. The transition is ${next.props.timing.getDurationInFrames(
						{fps},
					)} frames long, but the sequence is only ${durationInFramesProp} frames long (${debugInfo})`,
				);
			}

			if (
				prev &&
				durationInFramesProp < prev.props.timing.getDurationInFrames({fps})
			) {
				throw new Error(
					`The duration of a <TransitionSeries.Sequence /> must not be shorter than the duration of the previous <TransitionSeries.Transition />. The transition is ${prev.props.timing.getDurationInFrames(
						{fps},
					)} frames long, but the sequence is only ${durationInFramesProp} frames long (${debugInfo})`,
				);
			}

			const {markup, name, stack} = (() => {
				if (castedChildAgain.type === PremountedSeriesSequence) {
					const {
						durationInFrames: _d,
						children: __children,
						stack: _stack,
						name: _name,
						...passedProps
					} = castedChildAgain.props as TransitionSeriesPremountedSequenceProps;

					return {
						name: _name ?? '<TS.PremountedSequence>',
						markup: (
							<PremountedSequence showInTimeline={false} {...passedProps}>
								{child}
							</PremountedSequence>
						),
						stack: _stack,
					};
				} else {
					const {
						durationInFrames: _d,
						children: __children,
						stack: _stack,
						name: _name,
						...passedProps
					} = castedChildAgain.props as TransitionSeriesSequenceProps;

					return {
						name: _name ?? '<TS.Sequence>',
						markup: (
							<Sequence showInTimeline={false} {...passedProps}>
								{child}
							</Sequence>
						),
						stack: _stack,
					};
				}
			})();

			if (next && prev && nextProgress !== null && prevProgress !== null) {
				const nextPresentation = next.props.presentation ?? slide();
				const prevPresentation = prev.props.presentation ?? slide();

				const UppercaseNextPresentation = nextPresentation.component;
				const UppercasePrevPresentation = prevPresentation.component;

				return (
					<Sequence
						name={name}
						from={Math.floor(actualStartFrame)}
						layout="none"
						stack={stack}
					>
						{/**
						// @ts-expect-error	*/}
						<UppercaseNextPresentation
							passedProps={nextPresentation.props ?? {}}
							presentationDirection="exiting"
							presentationProgress={nextProgress}
						>
							{/**
						// @ts-expect-error	*/}
							<UppercasePrevPresentation
								passedProps={prevPresentation.props ?? {}}
								presentationDirection="entering"
								presentationProgress={prevProgress}
							>
								{markup}
							</UppercasePrevPresentation>
						</UppercaseNextPresentation>
					</Sequence>
				);
			}

			if (prevProgress !== null && prev) {
				const prevPresentation = prev.props.presentation ?? slide();

				const UppercasePrevPresentation = prevPresentation.component;

				return (
					<Sequence
						name={name}
						from={Math.floor(actualStartFrame)}
						durationInFrames={durationInFramesProp}
						layout="none"
						stack={stack}
					>
						{/**
						// @ts-expect-error	*/}
						<UppercasePrevPresentation
							passedProps={prevPresentation.props ?? {}}
							presentationDirection="entering"
							presentationProgress={prevProgress}
						>
							{markup}
						</UppercasePrevPresentation>
					</Sequence>
				);
			}

			if (nextProgress !== null && next) {
				const nextPresentation = next.props.presentation ?? slide();

				const UppercaseNextPresentation = nextPresentation.component;

				return (
					<Sequence
						name={name}
						from={Math.floor(actualStartFrame)}
						durationInFrames={durationInFramesProp}
						layout="none"
						stack={stack}
					>
						{/**
						// @ts-expect-error	*/}
						<UppercaseNextPresentation
							passedProps={nextPresentation.props ?? {}}
							presentationDirection="exiting"
							presentationProgress={nextProgress}
						>
							{markup}
						</UppercaseNextPresentation>
					</Sequence>
				);
			}

			if (castedChildAgain.type === PremountedSeriesSequence) {
				const {
					durationInFrames,
					name: _name,
					...props
				} = castedChildAgain.props as TransitionSeriesPremountedSequenceProps;
				return (
					<PremountedSequence
						name={_name ?? '<TS.PremountedSequence>'}
						from={Math.floor(actualStartFrame)}
						{...props}
					>
						{child}
					</PremountedSequence>
				);
			} else {
				const {
					durationInFrames,
					name: _name,
					...props
				} = castedChildAgain.props as TransitionSeriesPremountedSequenceProps;

				return (
					<Sequence
						name={_name ?? '<TS.Sequence>'}
						from={Math.floor(actualStartFrame)}
						durationInFrames={durationInFramesProp}
						{...props}
					>
						{child}
					</Sequence>
				);
			}
		});
	}, [children, fps, frame]);

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{childrenValue}</>;
};

const TransitionSeries: FC<SequencePropsWithoutDuration> & {
	Sequence: typeof SeriesSequence;
	PremountedSequence: typeof PremountedSeriesSequence;
	Transition: typeof TransitionSeriesTransition;
} = ({children, name, ...otherProps}) => {
	const displayName = name ?? '<TransitionSeries>';
	return (
		// TODO: Does it make sense to support layout="none"?
		<Sequence name={displayName} {...otherProps}>
			<TransitionSeriesChildren>{children}</TransitionSeriesChildren>
		</Sequence>
	);
};

TransitionSeries.Sequence = SeriesSequence;
TransitionSeries.PremountedSequence = PremountedSeriesSequence;
TransitionSeries.Transition = TransitionSeriesTransition;

export {TransitionSeries};

Internals.addSequenceStackTraces(TransitionSeries);
Internals.addSequenceStackTraces(SeriesSequence);
