import React, {useContext} from 'react';
import {BORDER_COLOR} from '../../helpers/colors';
import {RenderQueueContext} from './context';
import {RenderQueueItem} from './RenderQueueItem';

const separatorStyle: React.CSSProperties = {
	borderBottom: '1px solid ' + BORDER_COLOR,
};

export const RenderQueue: React.FC = () => {
	const {jobs} = useContext(RenderQueueContext);

	return (
		<div>
			{jobs.map((j, index) => {
				return (
					<div
						key={j.id}
						style={index === jobs.length - 1 ? undefined : separatorStyle}
					>
						<RenderQueueItem job={j} />
					</div>
				);
			})}
		</div>
	);
};
