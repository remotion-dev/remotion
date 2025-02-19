import React, {useMemo} from 'react';

const container: React.CSSProperties = {
	height: 16,
	width: 16,
	backgroundColor: 'red',
	border: '1px solid rgba(255, 255, 255, 0.2)',
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
