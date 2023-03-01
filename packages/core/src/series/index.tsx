import type {FC, PropsWithChildren} from 'react';
import {Children, forwardRef, useMemo} from 'react';
import type {LayoutAndStyle, SequenceProps} from '../Sequence.js';
import {Sequence} from '../Sequence.js';
import {validateDurationInFrames} from '../validation/validate-duration-in-frames.js';
import {flattenChildren} from './flatten-children.js';

type SeriesSequenceProps = PropsWithChildren<
	{
		durationInFrames: number;
		offset?: number;
	} & Pick<SequenceProps, 'layout' | 'name'> &
		LayoutAndStyle
>;

const SeriesSequenceRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLDivElement,
	SeriesSequenceProps
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
> = ({children}, _ref) => {
	// Discard ref
	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
};

const SeriesSequence = forwardRef(SeriesSequenceRefForwardingFunction);

/**
 * @description with this component, you can easily stitch together scenes that should play sequentially after another.
 * @see [Documentation](https://www.remotion.dev/docs/series)
 */
const Series: FC<{
	children: React.ReactNode;
}> & {
	Sequence: typeof SeriesSequence;
} = ({children}) => {
	const childrenValue = useMemo(() => {
		let startFrame = 0;
		const flattenedChildren = flattenChildren(children);
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
					`The <Series /> component only accepts a list of <Series.Sequence /> components as it's children, but you passed a string "${castedChild}"`
				);
			}

			if (castedChild.type !== SeriesSequence) {
				throw new TypeError(
					`The <Series /> component only accepts a list of <Series.Sequence /> components as it's children, but got ${castedChild} instead`
				);
			}

			const debugInfo = `index = ${i}, duration = ${castedChild.props.durationInFrames}`;

			if (!castedChild?.props.children) {
				throw new TypeError(
					`A <Series.Sequence /> component (${debugInfo}) was detected to not have any children. Delete it to fix this error.`
				);
			}

			const durationInFramesProp = castedChild.props.durationInFrames;
			const {
				durationInFrames,
				children: _children,
				...passedProps
			} = castedChild.props;

			if (
				i !== flattenedChildren.length - 1 ||
				durationInFramesProp !== Infinity
			) {
				validateDurationInFrames(
					durationInFramesProp,
					`of a <Series.Sequence /> component`,
					true
				);
			}

			const offset = castedChild.props.offset ?? 0;
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

			const currentStartFrame = startFrame + offset;
			startFrame += durationInFramesProp + offset;
			return (
				<Sequence
					from={currentStartFrame}
					durationInFrames={durationInFramesProp}
					{...passedProps}
					ref={castedChild.ref}
				>
					{child}
				</Sequence>
			);
		});
	}, [children]);

	/* eslint-disable react/jsx-no-useless-fragment */
	return <>{childrenValue}</>;
};

Series.Sequence = SeriesSequence;

export {Series};
