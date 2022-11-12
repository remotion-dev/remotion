import React, {useContext} from 'react';
import {RenderQueueContext} from './context';
import {RenderQueueItem} from './RenderQueueItem';

export const RenderQueue: React.FC = () => {
	const {jobs} = useContext(RenderQueueContext);

	return (
		<div>
			{jobs.map((j) => {
				return (
					<div key={j.id}>
						<RenderQueueItem job={j} />
					</div>
				);
			})}
		</div>
	);
};
