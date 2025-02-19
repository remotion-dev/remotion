import React, {useContext, useMemo} from 'react';
import {interpolateColors, random} from 'remotion';
import {SplitterContext} from './SplitterContext';

export const SplitterElement: React.FC<{
	readonly type: 'flexer' | 'anti-flexer';
	readonly children: React.ReactNode;
	readonly sticky: React.ReactNode | null;
}> = ({children, type, sticky}) => {
	const context = useContext(SplitterContext);

	const style: React.CSSProperties = useMemo(() => {
		return {
			flex:
				// Multiply by 1000 because if flex values don't add up to at least 1, they will not fill up the screen
				(type === 'flexer' ? context.flexValue : 1 - context.flexValue) * 1000,
			display: 'flex',
			position: 'relative',
			overflow: 'hidden',
			flexDirection: 'column',
		};
	}, [context.flexValue, type]);

	const stickStyle: React.CSSProperties = useMemo(() => {
		return {
			position: 'absolute',
			left: (type === 'flexer' ? 0 : context.flexValue) * 100 + '%',
			width:
				(type === 'flexer' ? context.flexValue : 1 - context.flexValue) * 100 +
				'%',
			backgroundColor: interpolateColors(
				random(context.flexValue),
				[0, 1],
				['red', 'blue'],
			),
		};
	}, [context.flexValue, type]);

	return (
		<>
			<div style={style}>{children}</div>
			<div style={stickStyle}>{sticky ?? null}</div>
		</>
	);
};
