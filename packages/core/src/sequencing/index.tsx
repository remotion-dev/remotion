import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {CompositionManager} from '../CompositionManager';
import {useAbsoluteCurrentFrame} from '../use-frame';

export const SequenceContext = createContext<{
	from: number;
	durationInFrames: number;
} | null>(null);

export const Sequence: React.FC<{
	from: number;
	durationInFrames: number;
}> = ({from, durationInFrames: duration, children}) => {
	const [id] = useState(() => String(Math.random()));
	const currentFrame = useAbsoluteCurrentFrame();
	const {registerSequence, unregisterSequence} = useContext(CompositionManager);

	const contextValue = useMemo(() => {
		return {
			from,
			durationInFrames: duration,
		};
	}, [duration, from]);

	useEffect(() => {
		registerSequence({
			from,
			duration,
			id,
		});
		return () => {
			unregisterSequence(id);
		};
	}, [duration, from, id, registerSequence, unregisterSequence]);

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
