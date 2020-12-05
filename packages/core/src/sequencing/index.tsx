import React, {createContext} from 'react';
import {useRawCurrentFrame} from '../use-frame';

export const SequenceContext = createContext<{
	from: number;
	durationInFrames: number;
} | null>(null);

export const Sequence: React.FC<{
	from: number;
	durationInFrames: number;
}> = ({from, durationInFrames: duration, children}) => {
	const currentFrame = useRawCurrentFrame();
	return (
		<SequenceContext.Provider
			value={{
				from,
				durationInFrames: duration,
			}}
		>
			<div
				style={{
					position: 'absolute',
					display: 'flex',
					width: '100%',
					height: '100%',
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
				}}
			>
				{currentFrame < from ? null : children}
			</div>
		</SequenceContext.Provider>
	);
};
