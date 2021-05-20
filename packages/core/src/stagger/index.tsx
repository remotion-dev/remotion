import {Children, FC, useMemo} from 'react';
import {Sequence} from '../sequencing';

const Stagger: FC<{componentDuration: Array<number>}> = ({
	children,
	componentDuration,
}) => {
	const childrenValue = useMemo(() => {
		return Children.map(children, (child, index) => {
			let startFrame = 0;
			componentDuration.forEach((currentDuration, i) => {
				if (i < index) {
					startFrame += currentDuration - 1;
				}
			});
			console.log(startFrame, 'startframee');
			return (
				<Sequence from={startFrame} durationInFrames={componentDuration[index]}>
					{child}
				</Sequence>
			);
		});
	}, [componentDuration, children]);

	/* eslint-disable react/jsx-no-useless-fragment */
	return <>{childrenValue}</>;
};

export {Stagger};
