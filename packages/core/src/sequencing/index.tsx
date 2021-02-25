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
	layout?: 'absolute-fill' | 'none';
}> = ({from, durationInFrames, children, name, layout = 'absolute-fill'}) => {
	const [id] = useState(() => String(Math.random()));
	const absoluteFrame = useAbsoluteCurrentFrame();
	const parentSequence = useContext(SequenceContext);
	const actualFrom = (parentSequence?.from ?? 0) + from;
	const {registerSequence, unregisterSequence} = useContext(CompositionManager);

	if (layout !== 'absolute-fill' && layout !== 'none') {
		throw new TypeError(
			`The layout prop of <Composition /> expects either "absolute-fill" or "none", but you passed: ${layout}`
		);
	}

	const contextValue = useMemo((): SequenceContextType => {
		return {
			from: actualFrom,
			durationInFrames,
			id,
		};
	}, [actualFrom, durationInFrames, id]);

	const timelineClipName = useMemo(() => {
		return name ?? getTimelineClipName(children);
	}, [children, name]);

	useEffect(() => {
		registerSequence({
			from: actualFrom,
			duration: durationInFrames,
			id,
			displayName: timelineClipName,
			parent: parentSequence?.id ?? null,
		});
		return () => {
			unregisterSequence(id);
		};
	}, [
		durationInFrames,
		actualFrom,
		id,
		name,
		registerSequence,
		timelineClipName,
		unregisterSequence,
		parentSequence?.id,
	]);

	const content =
		absoluteFrame < actualFrom
			? null
			: absoluteFrame > actualFrom + durationInFrames
			? null
			: children;

	return (
		<SequenceContext.Provider value={contextValue}>
			{layout === 'absolute-fill' ? (
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
					{content}
				</div>
			) : (
				content
			)}
		</SequenceContext.Provider>
	);
};
