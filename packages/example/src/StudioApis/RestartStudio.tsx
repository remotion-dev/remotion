import {restartStudio} from '@remotion/studio';
import React, {useCallback} from 'react';
import {AbsoluteFill} from 'remotion';

export const ClickUpdate: React.FC = () => {
	const onClickUpdate = useCallback(() => {
		restartStudio();
	}, []);

	return (
		<AbsoluteFill>
			<button type="button" onClick={onClickUpdate}>
				Click update
			</button>
		</AbsoluteFill>
	);
};
