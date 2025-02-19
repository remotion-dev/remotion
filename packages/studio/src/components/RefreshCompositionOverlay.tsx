import React from 'react';
import {AbsoluteFill} from 'remotion';
import {RunningCalculateMetadata} from './RunningCalculateMetadata';

export const container: React.CSSProperties = {
	justifyContent: 'flex-end',
	alignItems: 'flex-start',
	padding: 20,
	pointerEvents: 'none',
};

const shadow: React.CSSProperties = {
	boxShadow: '0 0 4px black',
};

export const RefreshCompositionOverlay: React.FC = () => {
	return (
		<AbsoluteFill style={container}>
			<div style={shadow}>
				<RunningCalculateMetadata />
			</div>
		</AbsoluteFill>
	);
};
