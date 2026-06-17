import React, {
	Children,
	forwardRef,
	useMemo,
	type FC,
	type PropsWithChildren,
} from 'react';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {sequenceSchemaDefaultLayoutNone} from '../interactivity-schema.js';
import type {LayoutAndStyle, SequenceProps} from '../Sequence.js';
import {Sequence, SequenceWithoutSchema} from '../Sequence.js';
import {validateDurationInFrames} from '../validation/validate-duration-in-frames.js';
import {withInteractivitySchema} from '../with-interactivity-schema.js';
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
	} & Pick<
		SequenceProps,
		'layout' | 'name' | 'hidden' | 'showInTimeline' | 'freeze'
	> &
		LayoutAndStyle
>;

const SeriesSequenceRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLDivElement,
	SeriesSequenceProps
> = ({children}, _ref) => {
	useRequireToBeInsideSeries();
	// Discard ref

	return <IsNotInsideSeriesProvider>{children}</IsNotInsideSeriesProvider>;
};

const SeriesSequence = forwardRef(SeriesSequenceRefForwardingFunction);

type SeriesProps = SequenceProps;
const SequenceWithoutSchemaWithRef =
	SequenceWithoutSchema as React.ComponentType<
		SequenceProps & {readonly ref?: React.Ref<HTMLDivElement>}
	>;

const SeriesInner: FC<SeriesProps> = (props) => {
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
				<SequenceWithoutSchemaWithRef
					ref={castedChild.ref}
					name={name || '<Series.Sequence>'}
					_remotionInternalDocumentationLink={
						name ? undefined : 'https://www.remotion.dev/docs/series'
					}
					from={currentStartFrame}
					durationInFrames={durationInFramesProp}
					{...passedProps}
				>
					{child}
				</SequenceWithoutSchemaWithRef>
			);
		});
	}, [props.children]);

	return (
		<IsInsideSeriesContainer>
			<Sequence
				layout="none"
				name="<Series>"
				_remotionInternalDocumentationLink="https://www.remotion.dev/docs/series"
				{...props}
			>
				{childrenValue}
			</Sequence>
		</IsInsideSeriesContainer>
	);
};

/**
 * @description with this component, you can easily stitch together scenes that should play sequentially after another.
 * @see [Documentation](https://www.remotion.dev/docs/series)
 */
const Series: React.ComponentType<SeriesProps> & {
	Sequence: typeof SeriesSequence;
} = Object.assign(
	withInteractivitySchema({
		Component: SeriesInner,
		componentName: '<Series>',
		componentIdentity: 'dev.remotion.remotion.Series',
		schema: sequenceSchemaDefaultLayoutNone,
		supportsEffects: false,
	}),
	{
		Sequence: SeriesSequence,
	},
);
export {Series};
addSequenceStackTraces(Series);
