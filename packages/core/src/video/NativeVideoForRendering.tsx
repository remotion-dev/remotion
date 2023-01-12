import React from 'react';
import {useCurrentFrame} from '../use-current-frame';

export const NativeVideoForRendering: React.FC<{
	src: string;
}> = ({src}) => {
	const frame = useCurrentFrame();
	return <>{JSON.stringify({src, frame})}</>;
};
