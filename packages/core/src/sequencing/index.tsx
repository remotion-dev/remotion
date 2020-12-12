import React, {createContext, useMemo} from 'react';
import {useAbsoluteCurrentFrame} from '../use-frame';

export const SequenceContext = createContext<{
	from: number;
	durationInFrames: number;
} | null>(null);

export const Sequence: React.FC<{
	from: number;
	durationInFrames: number;
}> = ({from, durationInFrames: duration, children}) => {
	const currentFrame = useAbsoluteCurrentFrame();

	const contextValue = useMemo(() => {
		return {
			from,
			durationInFrames: duration,
		};
	}, [duration, from]);
	return (
		<SequenceContext.Provider value={contextValue}>
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
				{currentFrame < from
					? null
					: currentFrame > from + duration
					? null
					: children}
			</div>
		</SequenceContext.Provider>
	);
};
