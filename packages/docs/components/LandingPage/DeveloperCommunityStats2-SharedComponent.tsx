import {useColorMode} from '@docusaurus/theme-common';
import React from 'react';

export const StatItemContent: React.FC<{
	content: React.ReactNode;
	width: string;
	height?: string;
	fontSize?: string;
	fontWeight?: React.CSSProperties['fontWeight'];
	className?: string; // Add className prop
}> = ({content, width, height = 'auto', fontSize, fontWeight, className}) => (
	<div
		className={`stat-item-content ${className}`} // Use className prop
		style={{width, height, fontSize, fontWeight}}
	>
		{content}
	</div>
);

export const useSvgFillColor = () => {
	const {isDarkTheme} = useColorMode();
	return isDarkTheme ? '#E3E3E3' : 'black';
};
