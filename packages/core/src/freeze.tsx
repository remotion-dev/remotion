import React, {useContext, useMemo} from 'react';
import {TimelineContext,TimelineContextValue} from './timeline-position-state';


type FreezeProps = {
	frame: number;
};

const Freeze: React.FC<FreezeProps> = ({frame,children}) => {
	const context = useContext(TimelineContext);
	const value: TimelineContextValue = useMemo(() => {
		return {
			...context,
			frame,
		};
	}, [context, frame]);

	return (
		<TimelineContext.Provider value={value}>
			{children}
		</TimelineContext.Provider>
	);
};

export {Freeze}