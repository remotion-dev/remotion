import {PlayerRef} from '@remotion/player';
import React from 'react';
import {useCurrentPlayerFrame} from './use-current-frame';

export const TimeDisplay: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
}> = ({playerRef}) => {
	const frame = useCurrentPlayerFrame(playerRef);

	return <div>current frame: {frame}</div>;
};
