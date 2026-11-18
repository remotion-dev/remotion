import React from 'react';
import {Interactive} from 'remotion';
import {useThemeColors} from './calculate-metadata/theme';

export const PADDING_X = 83;
export const TOP_EXPLAINER_HEIGHT = 100;

export const TopExplainer: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {editor} = useThemeColors();
	return (
		<Interactive.Div
			name="Code example heading"
			style={{
				color: editor.foreground,
				fontFamily: 'GT Planar',
				height: 100,
				borderBottom:
					'2px solid color-mix(in srgb, currentColor 15%, transparent)',
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
