import React, {useMemo} from 'react';

export const SPACING_UNIT = 8;

export const Spacing: React.FC<{
	x?: number;
	y?: number;
}> = ({x = 0, y = 0}) => {
	const style = useMemo((): React.CSSProperties => {
		return {
			display: 'block',
			width: x * SPACING_UNIT,
			height: y * SPACING_UNIT,
		};
	}, [x, y]);

	return <div style={style} />;
};
