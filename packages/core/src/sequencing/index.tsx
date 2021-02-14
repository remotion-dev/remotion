import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {CompositionManager} from '../CompositionManager';
import {getTimelineClipName} from '../get-timeline-clip-name';
import {useAbsoluteCurrentFrame} from '../use-frame';

type SequenceContextType = {
	from: number;
	durationInFrames: number;
	id: string;
};

export const SequenceContext = createContext<SequenceContextType | null>(null);

export const Sequence: React.FC<{
	from: number;
	durationInFrames: number;
	name?: string;
}> = ({from, durationInFrames: duration, children, name}) => {
	const [id] = useState(() => String(Math.random()));
	const absoluteFrame = useAbsoluteCurrentFrame();
	const parentSequence = useContext(SequenceContext);
	const actualFrom = (parentSequence?.from ?? 0) + from;
	const {registerSequence, unregisterSequence} = useContext(CompositionManager);

	const contextValue = useMemo((): SequenceContextType => {
		return {
			from: actualFrom,
			durationInFrames: duration,
			id,
		};
	}, [actualFrom, duration, id]);

	const timelineClipName = useMemo(() => {
		return name ?? getTimelineClipName(children);
	}, [children, name]);

	useEffect(() => {
		registerSequence({
			from: actualFrom,
			duration,
			id,
			displayName: timelineClipName,
			parent: parentSequence?.id ?? null,
		});
		return () => {
			unregisterSequence(id);
		};
	}, [
		duration,
		actualFrom,
		id,
		name,
		registerSequence,
		timelineClipName,
		unregisterSequence,
		parentSequence?.id,
	]);

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
				{absoluteFrame < actualFrom
					? null
					: absoluteFrame > actualFrom + duration
					? null
					: children}
			</div>
		</SequenceContext.Provider>
	);
};
