import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

export const CustomEditorIcon: React.FC<{readonly size: number | null}> = ({
	size: sizeProp,
}) => (
	<svg
		focusable="false"
		role="img"
		viewBox="0 0 24 24"
		style={{
			width: sizeProp ?? 14,
			height: sizeProp ?? 14,
			flexShrink: 0,
		}}
	>
		<path
			fill="none"
			stroke={CURRENT_COLOR}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.8"
			d="m8 8-4 4 4 4m8-8 4 4-4 4m-2-10-4 12"
		/>
	</svg>
);
