import {useEffect} from 'react';
import {delayRender, random, useCurrentFrame} from 'remotion';

export const RetryDelayRender: React.FC = () => {
	const frame = useCurrentFrame();
	useEffect(() => {
		if (random(null) < 0.6) {
			delayRender('Retrying twice', {
				timeoutInMilliseconds: 7000,
			});
		}
	}, [frame]);

	return null;
};
