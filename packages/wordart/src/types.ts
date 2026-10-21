import type React from 'react';

export type WordArtProps = {
	readonly children: string;
	readonly width?: number;
	readonly height?: number;
	readonly fontFamily?: string;
	readonly fontWeight?: React.CSSProperties['fontWeight'];
	readonly depth?: number;
	readonly distortion?: number;
	readonly style?: React.CSSProperties;
	readonly className?: string;
};
