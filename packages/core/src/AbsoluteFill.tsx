import type {HTMLAttributes} from 'react';
import React, { useMemo} from 'react';

/**
 * An absolutely positioned <div> element with 100% width, height, and a column flex style
 * @link https://www.remotion.dev/docs/absolute-fill
 */
export const AbsoluteFill: React.FC<HTMLAttributes<HTMLDivElement>> = (
	props
) => {
	const {style, ...other} = props;
	const actualStyle = useMemo((): React.CSSProperties => {
		return {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			width: '100%',
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			...style,
		};
	}, [style]);

	return <div style={actualStyle} {...other} />;
};
