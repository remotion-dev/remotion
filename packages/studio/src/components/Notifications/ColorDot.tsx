import React, {useMemo} from 'react';
import {BORDER_WHITE_ALPHA_20, RED} from '../../helpers/colors';

const container: React.CSSProperties = {
	height: 16,
	width: 16,
	backgroundColor: RED,
	border: BORDER_WHITE_ALPHA_20,
	borderRadius: 8,
};

export const ColorDot: React.FC<{
	readonly color: string;
}> = ({color}) => {
	const style = useMemo(() => {
		return {
			...container,
			backgroundColor: color,
		};
	}, [color]);

	return <div style={style} />;
};
