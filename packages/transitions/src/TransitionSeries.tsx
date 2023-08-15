import type {FC, PropsWithChildren} from 'react';
import {Children, useMemo} from 'react';
import type {SequenceProps} from 'remotion';
import {Internals, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TransitionSeriesTransitionProps} from './types';

// eslint-disable-next-line react/function-component-definition
const TransitionSeriesTransition = function <
	PresentationProps extends Record<string, unknown>
>(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_props: TransitionSeriesTransitionProps<PresentationProps>
) {
	return null;
};

type SeriesSequenceProps = PropsWithChildren<
	{
		durationInFrames: number;
		offset?: number;
	} & Pick<SequenceProps, 'layout' | 'name'>
>;

const SeriesSequence = ({children}: SeriesSequenceProps) => {
	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
};

type TransitionType<PresentationProps extends Record<string, unknown>> = {
	props: TransitionSeriesTransitionProps<PresentationProps>;
	type: typeof TransitionSeriesTransition;
};

type TypeChild<PresentationProps extends Record<string, unknown>> =
	| {
			props: SeriesSequenceProps;
			type: typeof SeriesSequence;
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
			const castedChild = child as unknown as TypeChild<
				Record<string, unknown>
			>;
			if (typeof castedChild === 'string') {
				// Don't throw if it's just some accidential whitespace
				if (castedChild.trim() === '') {
					return null;
				}

				throw new TypeError(
					`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but you passed a string "${castedChild}"`
				);
			}

			if (castedChild.type === TransitionSeriesTransition) {
				return null;
			}

			if (castedChild.type !== SeriesSequence) {
				throw new TypeError(
					`The <Series /> component only accepts a list of <Series.Sequence /> and <Series.Transition /> components as its children, but got ${castedChild} instead`
				);
			}

			const castedChildAgain = castedChild as {
				props: SeriesSequenceProps;
				type: typeof SeriesSequence;
			};

			const debugInfo = `index = ${i}, duration = ${castedChildAgain.props.durationInFrames}`;

			if (!castedChildAgain || !castedChildAgain.props.children) {
				throw new TypeError(
					`A <Series.Sequence /> component (${debugInfo}) was detected to not have any children. Delete it to fix this error.`
				);
			}

			const durationInFramesProp = castedChildAgain.props.durationInFrames;
			const {
				durationInFrames,
				children: _children,
				...passedProps
			} = castedChildAgain.props;
			Internals.validateDurationInFrames(durationInFramesProp, {
				component: `of a <Series.Sequence /> component`,
				allowFloats: false,
			});
			const offset = castedChildAgain.props.offset ?? 0;
			if (Number.isNaN(offset)) {
				throw new TypeError(
					`The "offset" property of a <Series.Sequence /> must not be NaN, but got NaN (${debugInfo}).`
				);
			}

			if (!Number.isFinite(offset)) {
				throw new TypeError(
					`The "offset" property of a <Series.Sequence /> must be finite, but got ${offset} (${debugInfo}).`
				);
			}

			if (offset % 1 !== 0) {
				throw new TypeError(
					`The "offset" property of a <Series.Sequence /> must be finite, but got ${offset} (${debugInfo}).`
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

			const currentStartFrame = startFrame + offset;

			let duration = 0;

			if (prev) {
				duration = prev.props.timing.getDurationInFrames({
					fps,
				});
				transitionOffsets -= duration;
			}

			const actualStartFrame = currentStartFrame + transitionOffsets;

			startFrame += durationInFramesProp + offset;

			const inner = (
				<Sequence
					from={Math.floor(actualStartFrame)}
					durationInFrames={durationInFramesProp}
					{...passedProps}
				>
					{child}
				</Sequence>
			);

			const nextProgress = next
				? next.props.timing.getProgress({
						frame:
							frame -
							actualStartFrame -
							durationInFrames +
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

			if (next && prev && nextProgress !== null && prevProgress !== null) {
				const UppercaseNextPresentation = next.props.presentation.component;
				const UppercasePrevPresentation = prev.props.presentation.component;

				return (
					// @ts-expect-error
					<UppercaseNextPresentation
						passedProps={next.props.presentation.props ?? {}}
						presentationDirection="out"
						presentationProgress={nextProgress}
					>
						{/**
						// @ts-expect-error	*/}
						<UppercasePrevPresentation
							passedProps={prev.props.presentation.props ?? {}}
							presentationDirection="in"
							presentationProgress={prevProgress}
						>
							{inner}
						</UppercasePrevPresentation>
					</UppercaseNextPresentation>
				);
			}

			if (prevProgress !== null && prev) {
				const UppercasePrevPresentation = prev.props.presentation.component;

				return (
					// @ts-expect-error

					<UppercasePrevPresentation
						passedProps={prev.props.presentation.props ?? {}}
						presentationDirection="in"
						presentationProgress={prevProgress}
					>
						{inner}
					</UppercasePrevPresentation>
				);
			}

			if (nextProgress !== null && next) {
				const UppercaseNextPresentation = next.props.presentation.component;

				return (
					// @ts-expect-error
					<UppercaseNextPresentation
						passedProps={next.props.presentation.props ?? {}}
						presentationDirection="out"
						presentationProgress={nextProgress}
					>
						{inner}
					</UppercaseNextPresentation>
				);
			}

			return inner;
		});
	}, [children, fps, frame]);

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{childrenValue}</>;
};

const TransitionSeries: FC<SequenceProps> & {
	Sequence: typeof SeriesSequence;
	Transition: typeof TransitionSeriesTransition;
} = ({children, ...otherProps}) => {
	const frame = useCurrentFrame();
	const showInTimeline = frame < (otherProps.from ?? 0);

	return (
		<Sequence showInTimeline={showInTimeline} {...otherProps}>
			<TransitionSeriesChildren>{children}</TransitionSeriesChildren>
		</Sequence>
	);
};

TransitionSeries.Sequence = SeriesSequence;
TransitionSeries.Transition = TransitionSeriesTransition;

export {TransitionSeries};

import React from 'react';

type ReactChildArray = ReturnType<typeof React.Children.toArray>;

const flattenChildren = (children: React.ReactNode): ReactChildArray => {
	const childrenArray = React.Children.toArray(children);
	return childrenArray.reduce((flatChildren: ReactChildArray, child) => {
		if ((child as React.ReactElement<unknown>).type === React.Fragment) {
			return flatChildren.concat(
				flattenChildren(
					(child as React.ReactElement<PropsWithChildren<unknown>>).props
						.children
				)
			);
		}

		flatChildren.push(child);
		return flatChildren;
	}, []);
};
