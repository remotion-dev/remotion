import {goToComposition, pause, play, seek, toggle} from '@remotion/studio';
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

	const onFourthClick = useCallback(() => {
		toggle();
	}, []);

	const onFifthClick = useCallback(() => {
		pause();
	}, []);

	const onSixthClick = useCallback(() => {
		play();
	}, []);

	const onSeventhClick = useCallback(() => {
		goToComposition('freeze-example');
	}, []);

	return (
		<AbsoluteFill>
			<button onClick={onClick}>Seek</button>
			<button onClick={onSecondClick}>Seek 10</button>
			<button onClick={onThirdClick}>Seek -100</button>
			<button onClick={onFourthClick}>Toggle</button>
			<button onClick={onFifthClick}>Pause</button>
			<button onClick={onSixthClick}>Play</button>
			<button onClick={onSeventhClick}>Go to Composition</button>
		</AbsoluteFill>
	);
};
