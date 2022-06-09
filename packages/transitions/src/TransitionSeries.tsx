import {Children, FC, PropsWithChildren, useMemo} from 'react';
import {
	Internals,
	measureSpring,
	Sequence,
	SequenceProps,
	spring,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {flattenChildren} from './flatten-children';
import {TransitionSeriesTransition} from './TransitionSeriesTransition';
import {TriangleEntrace} from './Triangle';

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

const springConfig: Partial<SpringConfig> = {
	damping: 200,
};

const TransitionSeries: FC<{
	children: React.ReactNode;
}> & {
	Sequence: typeof SeriesSequence;
	Transition: typeof TransitionSeriesTransition;
} = ({children}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	let transitionOffsets = 0;
	const childrenValue = useMemo(() => {
		let startFrame = 0;
		const flattedChildren = flattenChildren(children);
		return Children.map(flattedChildren, (child, i) => {
			const castedChild = child as unknown as
				| {
						props: SeriesSequenceProps;
						type: typeof SeriesSequence;
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

			if (castedChild.type === TransitionSeriesTransition) {
				return null;
			}

			if (castedChild.type !== SeriesSequence) {
				throw new TypeError(
					`The <Series /> component only accepts a list of <Series.Sequence /> and <Series.Transition /> components as it's children, but got ${castedChild} instead`
				);
			}

			const debugInfo = `index = ${i}, duration = ${castedChild.props.durationInFrames}`;

			if (!castedChild || !castedChild.props.children) {
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
			Internals.validateDurationInFrames(
				durationInFramesProp,
				`of a <Series.Sequence /> component`
			);
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

			const prev = flattedChildren[i - 1];
			const next = flattedChildren[i + 1];
			const currentStartFrame = startFrame + offset;
			const duration = measureSpring({
				fps,
				config: springConfig,
			});

			if (prev) {
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

			if (prev) {
				return (
					<TriangleEntrace
						type="in"
						progress={spring({
							fps,
							frame: frame - actualStartFrame,
							config: springConfig,
						})}
					>
						{inner}
					</TriangleEntrace>
				);
			}

			if (next) {
				return (
					<TriangleEntrace
						type="out"
						progress={spring({
							fps,
							frame: frame - actualStartFrame - durationInFrames + duration,
							config: springConfig,
						})}
					>
						{inner}
					</TriangleEntrace>
				);
			}

			return inner;
		});
	}, [children, fps, frame]);

	/* eslint-disable react/jsx-no-useless-fragment */
	return <>{childrenValue}</>;
};

TransitionSeries.Sequence = SeriesSequence;
TransitionSeries.Transition = TransitionSeriesTransition;

export {TransitionSeries};
