import type {FC, PropsWithChildren} from 'react';
import React, {Children, forwardRef, useMemo} from 'react';
import type {LayoutAndStyle, SequenceProps} from '../Sequence.js';
import {Sequence} from '../Sequence.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {ENABLE_V5_BREAKING_CHANGES} from '../v5-flag.js';
import {validateDurationInFrames} from '../validation/validate-duration-in-frames.js';
import {flattenChildren} from './flatten-children.js';
import {
	IsInsideSeriesContainer,
	IsNotInsideSeriesProvider,
	useRequireToBeInsideSeries,
} from './is-inside-series.js';

type SeriesSequenceProps = PropsWithChildren<
	{
		readonly durationInFrames: number;
		readonly offset?: number;
		readonly className?: string;
	} & Pick<SequenceProps, 'layout' | 'name'> &
		LayoutAndStyle
>;

const SeriesSequenceRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLDivElement,
	SeriesSequenceProps
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
> = ({children}, _ref) => {
	useRequireToBeInsideSeries();
	// Discard ref

	return <IsNotInsideSeriesProvider>{children}</IsNotInsideSeriesProvider>;
};

const SeriesSequence = forwardRef(SeriesSequenceRefForwardingFunction);

type V4Props = {
	children: React.ReactNode;
};

type V5Props = SequenceProps;

type SeriesProps = true extends typeof ENABLE_V5_BREAKING_CHANGES
	? V5Props
	: V4Props;

/**
 * @description with this component, you can easily stitch together scenes that should play sequentially after another.
 * @see [Documentation](https://www.remotion.dev/docs/series)
 */
const Series: FC<SeriesProps> & {
	Sequence: typeof SeriesSequence;
} = (props) => {
	const childrenValue = useMemo(() => {
		let startFrame = 0;
		const flattenedChildren = flattenChildren(props.children);
		return Children.map(flattenedChildren, (child, i) => {
			const castedChild = child as unknown as
				| {
						props: SeriesSequenceProps;
						type: typeof SeriesSequence;
						ref: React.MutableRefObject<HTMLDivElement>;
				  }
				| string;
			if (typeof castedChild === 'string') {
				// Don't throw if it's just some accidential whitespace
				if (castedChild.trim() === '') {
					return null;
				}

				throw new TypeError(
					`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but you passed a string "${castedChild}"`,
				);
			}

			if (castedChild.type !== SeriesSequence) {
				throw new TypeError(
					`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but got ${castedChild} instead`,
				);
			}

			const debugInfo = `index = ${i}, duration = ${castedChild.props.durationInFrames}`;

			if (!castedChild?.props.children) {
				throw new TypeError(
					`A <Series.Sequence /> component (${debugInfo}) was detected to not have any children. Delete it to fix this error.`,
				);
			}

			const durationInFramesProp = castedChild.props.durationInFrames;
			const {
				durationInFrames,
				children: _children,
				from,
				name,
				...passedProps
			} = castedChild.props as SeriesSequenceProps & {from: never}; // `from` is not accepted and must be filtered out if used in JS

			if (
				i !== flattenedChildren.length - 1 ||
				durationInFramesProp !== Infinity
			) {
				validateDurationInFrames(durationInFramesProp, {
					component: `of a <Series.Sequence /> component`,
					allowFloats: true,
				});
			}

			const offset = castedChild.props.offset ?? 0;
			if (Number.isNaN(offset)) {
				throw new TypeError(
					`The "offset" property of a <Series.Sequence /> must not be NaN, but got NaN (${debugInfo}).`,
				);
			}

			if (!Number.isFinite(offset)) {
				throw new TypeError(
					`The "offset" property of a <Series.Sequence /> must be finite, but got ${offset} (${debugInfo}).`,
				);
			}

			if (offset % 1 !== 0) {
				throw new TypeError(
					`The "offset" property of a <Series.Sequence /> must be finite, but got ${offset} (${debugInfo}).`,
				);
			}

			const currentStartFrame = startFrame + offset;
			startFrame += durationInFramesProp + offset;
			return (
				<Sequence
					name={name || '<Series.Sequence>'}
					from={currentStartFrame}
					durationInFrames={durationInFramesProp}
					{...passedProps}
					ref={castedChild.ref}
				>
					{child}
				</Sequence>
			);
		});
	}, [props.children]);

	if (ENABLE_V5_BREAKING_CHANGES) {
		return (
			<IsInsideSeriesContainer>
				<Sequence {...props}>{childrenValue}</Sequence>
			</IsInsideSeriesContainer>
		);
	}

	return <IsInsideSeriesContainer>{childrenValue}</IsInsideSeriesContainer>;
};

Series.Sequence = SeriesSequence;

export {Series};

addSequenceStackTraces(SeriesSequence);
