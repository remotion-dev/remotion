import React, {Children, FC, PropsWithChildren, useMemo} from 'react';
import {Sequence, SequenceProps} from '../sequencing';
import {validateDurationInFrames} from '../validation/validate-duration-in-frames';

type StaggerChildProps = PropsWithChildren<
	{
		durationInFrames: number;
		offset?: number;
	} & Pick<SequenceProps, 'layout' | 'name'>
>;

const StaggerChild = ({children}: StaggerChildProps) => {
	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
};

const Stagger: FC = ({children}) => {
	const childrenValue = useMemo(() => {
		let startFrame = 0;
		return Children.map(children, (child, i) => {
			const castedChild = (child as unknown) as
				| {
						props: StaggerChildProps;
						type: typeof StaggerChild;
				  }
				| string;
			if (typeof castedChild === 'string') {
				if (castedChild.trim() === '') {
					return null;
				}

				throw new TypeError(
					`The <Stagger> component only accepts a list of <StaggerChild /> components as it's children, but you passed a string "${castedChild}"`
				);
			}

			if (castedChild.type !== StaggerChild) {
				throw new TypeError(
					"The <Stagger> component only accepts a list of <StaggerChild /> components as it's children"
				);
			}

			const debugInfo = `index = ${i}, duration = ${castedChild.props.durationInFrames}`;

			if (!castedChild || !castedChild.props.children) {
				throw new TypeError(
					`A <StaggerChild /> component (${debugInfo}) doesn't have any children.`
				);
			}

			const durationInFramesProp = castedChild.props.durationInFrames;
			const {
				durationInFrames,
				children: _children,
				...passedProps
			} = castedChild.props;
			validateDurationInFrames(durationInFramesProp, `<StaggerChild />`);
			const offset = castedChild.props.offset ?? 0;
			if (Number.isNaN(offset)) {
				throw new TypeError(
					`The "offset" property of a <StaggerChild /> must not be NaN, but got NaN (${debugInfo}).`
				);
			}

			if (!Number.isFinite(offset)) {
				throw new TypeError(
					`The "offset" property of a <StaggerChild /> must be finite, but got ${offset} (${debugInfo}).`
				);
			}

			if (offset % 1 !== 0) {
				throw new TypeError(
					`The "offset" property of a <StaggerChild /> must be finite, but got ${offset} (${debugInfo}).`
				);
			}

			const currentStartFrame = startFrame + offset;
			startFrame += durationInFramesProp + offset;
			return (
				<Sequence
					from={currentStartFrame}
					durationInFrames={durationInFramesProp}
					{...passedProps}
				>
					{child}
				</Sequence>
			);
		});
	}, [children]);

	/* eslint-disable react/jsx-no-useless-fragment */
	return <>{childrenValue}</>;
};

export {Stagger, StaggerChild};
