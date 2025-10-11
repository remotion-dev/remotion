import {useEffect} from 'react';
import {random, useCurrentFrame, useDelayRender} from 'remotion';

export const RetryDelayRender: React.FC = () => {
	const frame = useCurrentFrame();
	const {delayRender} = useDelayRender();
	useEffect(() => {
		if (random(null) < 0.6) {
			delayRender('Retrying twice', {
				timeoutInMilliseconds: 7000,
			});
		}
	}, [frame, delayRender]);

	return null;
};
