import React from 'react';
import {useCurrentFrame} from '../use-current-frame';

export type NativeVideoLayerInfo = {
	src: string;
	frame: string;
};

export const NativeVideoForRendering: React.FC<{
	src: string;
}> = ({src}) => {
	const frame = useCurrentFrame();
	return (
		<div
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={{
				__html: JSON.stringify({src, frame}),
			}}
		/>
	);
};
