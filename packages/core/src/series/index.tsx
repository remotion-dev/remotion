import React, {
	forwardRef,
	useMemo,
	type FC,
	type PropsWithChildren,
} from 'react';
import type {SequenceControls} from '../CompositionManager.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {Interactive} from '../Interactive.js';
import {
	sequenceSchemaDefaultLayoutNone,
	type InteractivitySchema,
} from '../interactivity-schema.js';
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

/* eslint-disable react/require-default-props -- public API props stay optional and are normalized by SeriesSequenceInner */
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
/* eslint-enable react/require-default-props */

type ResolvedSeriesSequenceProps = SeriesSequenceProps & {
	readonly controls: SequenceControls | null | undefined;
	readonly stack: string | null;
};

type InternalSeriesSequenceProps = ResolvedSeriesSequenceProps & {
	readonly _remotionInternalRender:
		| ((
				props: ResolvedSeriesSequenceProps,
				ref: React.ForwardedRef<HTMLDivElement>,
		  ) => React.ReactNode)
		| null;
};

const seriesSequenceSchema = {
	durationInFrames: Interactive.baseSchema.durationInFrames,
	name: Interactive.sequenceSchema.name,
	hidden: Interactive.sequenceSchema.hidden,
	showInTimeline: Interactive.sequenceSchema.showInTimeline,
	freeze: Interactive.baseSchema.freeze,
	layout: Interactive.sequenceSchema.layout,
} as const satisfies InteractivitySchema;

const SeriesSequenceInner = forwardRef<
	HTMLDivElement,
	InternalSeriesSequenceProps
>(
	(
		{
			offset = 0,
			className = '',
			stack = null,
			_remotionInternalRender = null,
			...props
		},
		ref,
	) => {
		useRequireToBeInsideSeries();
		if (_remotionInternalRender) {
			return _remotionInternalRender(
				{...props, offset, className: className || undefined, stack},
				ref,
			);
		}

		return (
			<IsNotInsideSeriesProvider>{props.children}</IsNotInsideSeriesProvider>
		);
	},
);

const SeriesSequence = Interactive.withSchema({
	Component: SeriesSequenceInner as unknown as React.ComponentType<
		SeriesSequenceProps & {
			readonly controls: SequenceControls | undefined;
		}
	>,
	componentName: '<Series.Sequence>',
	componentIdentity: 'dev.remotion.remotion.Series.Sequence',
	schema: seriesSequenceSchema,
	supportsEffects: false,
}) as React.ForwardRefExoticComponent<
	SeriesSequenceProps & React.RefAttributes<HTMLDivElement>
>;

type SeriesProps = SequenceProps;
const SequenceWithoutSchemaWithRef =
	SequenceWithoutSchema as React.ComponentType<
		SequenceProps & {readonly ref?: React.Ref<HTMLDivElement>}
	>;

const validateSeriesSequenceProps = ({
	durationInFrames,
	offset: offsetProp,
	index,
	childrenLength,
}: {
	readonly durationInFrames: number;
	readonly offset: number | undefined;
	readonly index: number;
	readonly childrenLength: number;
}) => {
	const debugInfo = `index = ${index}, duration = ${durationInFrames}`;
	if (index !== childrenLength - 1 || durationInFrames !== Infinity) {
		validateDurationInFrames(durationInFrames, {
			component: `of a <Series.Sequence /> component`,
			allowFloats: true,
		});
	}

	const offset = offsetProp ?? 0;
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

	return offset;
};

const SeriesInner: FC<SeriesProps> = (props) => {
	const childrenValue = useMemo(() => {
		const flattenedChildren = flattenChildren(props.children);
		const renderChildren = (i: number, startFrame: number): React.ReactNode => {
			if (i === flattenedChildren.length) {
				return null;
			}

			const child = flattenedChildren[i];
			const castedChild = child as unknown as
				| {
						props: InternalSeriesSequenceProps;
						type: typeof SeriesSequence;
				  }
				| string;
			if (typeof castedChild === 'string') {
				// Don't throw if it's just some accidential whitespace
				if (castedChild.trim() === '') {
					return renderChildren(i + 1, startFrame);
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

			const castedElement = castedChild as React.ReactElement<
				InternalSeriesSequenceProps,
				typeof SeriesSequence
			>;
			validateSeriesSequenceProps({
				durationInFrames: castedElement.props.durationInFrames,
				offset: castedElement.props.offset,
				index: i,
				childrenLength: flattenedChildren.length,
			});

			return React.cloneElement(castedElement, {
				_remotionInternalRender: (resolvedProps, ref) => {
					const durationInFramesProp = resolvedProps.durationInFrames;
					const {
						durationInFrames: _durationInFrames,
						children: sequenceChildren,
						offset: offsetProp,
						controls,
						stack,
						from: _from,
						name,
						...passedProps
					} = resolvedProps as InternalSeriesSequenceProps & {from: never}; // `from` is not accepted and must be filtered out if used in JS

					const offset = validateSeriesSequenceProps({
						durationInFrames: durationInFramesProp,
						offset: offsetProp,
						index: i,
						childrenLength: flattenedChildren.length,
					});

					const currentStartFrame = startFrame + offset;
					const nextStartFrame = startFrame + durationInFramesProp + offset;

					return (
						<>
							<SequenceWithoutSchemaWithRef
								ref={ref}
								name={name || '<Series.Sequence>'}
								_remotionInternalDocumentationLink={
									name ? undefined : 'https://www.remotion.dev/docs/series'
								}
								_remotionInternalStack={stack ?? undefined}
								controls={controls ?? undefined}
								from={currentStartFrame}
								durationInFrames={durationInFramesProp}
								{...passedProps}
							>
								<IsNotInsideSeriesProvider>
									{sequenceChildren}
								</IsNotInsideSeriesProvider>
							</SequenceWithoutSchemaWithRef>
							{renderChildren(i + 1, nextStartFrame)}
						</>
					);
				},
			});
		};

		return renderChildren(0, 0);
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
