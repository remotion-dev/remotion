import React, {useContext, useMemo} from 'react';
import {SequenceContext} from './Sequence';
import type {TimelineContextValue} from './timeline-position-state';
import {TimelineContext} from './timeline-position-state';

type FreezeProps = {
	frame: number;
	children: React.ReactNode;
};

export const Freeze: React.FC<FreezeProps> = ({frame, children}) => {
	if (typeof frame === 'undefined') {
		throw new Error(
			`The <Freeze /> component requires a 'frame' prop, but none was passed.`
		);
	}

	if (typeof frame !== 'number') {
		throw new Error(
			`The 'frame' prop of <Freeze /> must be a number, but is of type ${typeof frame}`
		);
	}

	if (Number.isNaN(frame)) {
		throw new Error(
			`The 'frame' prop of <Freeze /> must be a real number, but it is NaN.`
		);
	}

	if (!Number.isFinite(frame)) {
		throw new Error(
			`The 'frame' prop of <Freeze /> must be a finite number, but it is ${frame}.`
		);
	}

	const context = useContext(TimelineContext);
	const value: TimelineContextValue = useMemo(() => {
		return {
			...context,
			playing: false,
			imperativePlaying: {
				current: false,
			},
			frame,
		};
	}, [context, frame]);

	return (
		<TimelineContext.Provider value={value}>
			<SequenceContext.Provider value={null}>
				{children}
			</SequenceContext.Provider>
		</TimelineContext.Provider>
	);
};
