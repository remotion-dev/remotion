import {useContext, useMemo} from 'react';
import {BufferingContextReact} from './buffering';

export const useBuffer = () => {
	const buffer = useContext(BufferingContextReact);

	if (!buffer) {
		throw new TypeError(
			'Can only use useBuffer() inside a Remotion composition',
		);
	}

	return useMemo(
		() => ({
			delayPlayback: () => {
				const {unblock} = buffer.addBlock({
					id: String(Math.random()),
				});

				return {unblock};
			},
		}),
		[buffer],
	);
};
