import React, {Children, FC, PropsWithChildren, useMemo} from 'react';
import {Sequence, SequenceProps} from '../sequencing';
import {validateDurationInFrames} from '../validation/validate-duration-in-frames';

type StaggerChildProps = PropsWithChildren<
	{
		durationInFrames: number;
	} & Pick<SequenceProps, 'layout' | 'name'>
>;

const StaggerChild = ({children}: StaggerChildProps) => {
	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
};

const Stagger: FC = ({children}) => {
	const childrenValue = useMemo(() => {
		let startFrame = 0;
		return Children.map(children, (child) => {
			const castedChild = (child as unknown) as {
				props: StaggerChildProps;
				type: typeof StaggerChild;
			};
			if (!castedChild || !castedChild.props.children) {
				throw new TypeError(`The StaggerChild component must have children.`);
			}

			if (castedChild.type !== StaggerChild) {
				throw new TypeError(
					"The <Stagger> component only accepts a list of <StaggerChild /> components as it's children"
				);
			}

			const durationInFramesProp = castedChild.props.durationInFrames;
			const {
				durationInFrames,
				children: _children,
				...passedProps
			} = castedChild.props;
			validateDurationInFrames(durationInFramesProp, `<StaggerChild />`);
			const currentStartFrame = startFrame;
			startFrame += durationInFramesProp;
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
