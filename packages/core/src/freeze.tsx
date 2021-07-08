import React, {useContext, useMemo} from 'react';
import {TimelineContext, TimelineContextValue} from './timeline-position-state';

type FreezeProps = {
	frame: number;
};

const Freeze: React.FC<FreezeProps> = ({frame, children}) => {
	if (typeof frame !== 'number') {
		throw new Error(
			`You passed to 'frame' an argument of type ${typeof frame}, but it must be a number.`
		);
	}

	const context = useContext(TimelineContext);
	const value: TimelineContextValue = useMemo(() => {
		return {
			...context,
			playing: false,
			frame,
		};
	}, [context, frame]);

	return (
		<TimelineContext.Provider value={value}>
			{children}
		</TimelineContext.Provider>
	);
};

export {Freeze};
