import React from 'react';
import {Internals} from 'remotion';
import {SHADOW_BLACK} from '../helpers/colors';
import {RunningCalculateMetadata} from './RunningCalculateMetadata';

export const container: React.CSSProperties = {
	justifyContent: 'flex-end',
	alignItems: 'flex-start',
	padding: 20,
	pointerEvents: 'none',
};

const shadow: React.CSSProperties = {
	boxShadow: SHADOW_BLACK,
};

export const RefreshCompositionOverlay: React.FC = () => {
	return (
		<Internals.AbsoluteFillElement style={container}>
			<div style={shadow}>
				<RunningCalculateMetadata />
			</div>
		</Internals.AbsoluteFillElement>
	);
};
