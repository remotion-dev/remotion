import {seek} from '@remotion/studio';
import React, {useCallback} from 'react';
import {AbsoluteFill} from 'remotion';

export const Seek: React.FC = () => {
	const onClick = useCallback(() => {
		seek(300);
	}, []);

	const onSecondClick = useCallback(() => {
		seek(10);
	}, []);

	const onThirdClick = useCallback(() => {
		seek(-10);
	}, []);

	return (
		<AbsoluteFill>
			<button onClick={onClick}>Seek</button>
			<button onClick={onSecondClick}>Seek 10</button>
			<button onClick={onThirdClick}>Seek -100</button>
		</AbsoluteFill>
	);
};
