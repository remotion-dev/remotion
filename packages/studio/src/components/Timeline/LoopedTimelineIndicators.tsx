import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Flex} from '../layout';
import {LoopedIndicator} from './LoopedIndicator';

const row: React.CSSProperties = {
	flexDirection: 'row',
};

export const LoopedTimelineIndicator: React.FC<{
	readonly loops: number;
}> = ({loops}) => {
	return (
		<AbsoluteFill style={row}>
			{new Array(loops).fill(true).map((_l, i) => {
				return (
					<React.Fragment
						// eslint-disable-next-line
						key={i}
					>
						<Flex />
						{i === loops - 1 ? null : <LoopedIndicator />}
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
