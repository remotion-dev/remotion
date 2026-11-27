import type {SVGProps} from 'react';
import React from 'react';
import {tikTokMark} from './social-media';

export const TikTok: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg {...props} viewBox={tikTokMark.viewBox}>
			<path fill="currentcolor" d={tikTokMark.path} />
		</svg>
	);
};
