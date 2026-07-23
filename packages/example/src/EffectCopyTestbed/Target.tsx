import React from 'react';
import {AbsoluteFill, Solid} from 'remotion';
import {label} from './label';

export const EffectCopyTarget: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#111827'}}>
			<Solid width={1080} height={1080} color="#f97316" />
			<div style={label}>Paste effects onto this Solid</div>
		</AbsoluteFill>
	);
};
