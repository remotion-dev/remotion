import {reevaluateComposition} from '@remotion/studio';
import React, {useCallback} from 'react';
import {AbsoluteFill} from 'remotion';

export const TriggerCalculateMetadata: React.FC = () => {
	const onClickUpdate = useCallback(() => {
		reevaluateComposition();
	}, []);

	return (
		<AbsoluteFill>
			<button type="button" onClick={onClickUpdate}>
				Click update
			</button>
		</AbsoluteFill>
	);
};
