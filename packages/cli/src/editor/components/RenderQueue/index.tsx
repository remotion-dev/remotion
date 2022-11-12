import React, {useContext} from 'react';
import {RenderQueueContext} from './context';

export const RenderQueue: React.FC = () => {
	const {jobs} = useContext(RenderQueueContext);

	return (
		<div>
			{jobs.map((j) => {
				return <div key={j.id}>{j.compositionId}</div>;
			})}
		</div>
	);
};
