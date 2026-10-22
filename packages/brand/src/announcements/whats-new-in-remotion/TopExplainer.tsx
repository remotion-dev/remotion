import React from 'react';
import {Interactive} from 'remotion';

export const PADDING_X = 83;
export const TOP_EXPLAINER_HEIGHT = 100;

export const TopExplainer: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<Interactive.Div
			name="Code example heading"
			style={{
				color: '#080D15',
				fontFamily: 'GT Planar',
				height: 100,
				borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
				fontSize: 34,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				opacity: 0.7,
				textAlign: 'center',
			}}
		>
			{children}
		</Interactive.Div>
	);
};
