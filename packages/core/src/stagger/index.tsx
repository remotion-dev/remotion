import {Children, FC, useMemo} from 'react';
import {Sequence} from '../sequencing';

const Stagger: FC<{componentDuration: Array<number>}> = ({
	children,
	componentDuration,
}) => {
	if (typeof componentDuration === 'undefined') {
		throw new Error(
			'componentDuration is a required props, pass a number array'
		);
	}

	if (Children.count(children) !== componentDuration.length) {
		throw new Error(
			'Length of componentDuration and number of component inside <Stagger /> should be same '
		);
	}

	const childrenValue = useMemo(() => {
		return Children.map(children, (child, index) => {
			let startFrame = 0;
			componentDuration.forEach((currentDuration, i) => {
				if (i < index) {
					startFrame += currentDuration - 1;
				}
			});
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
