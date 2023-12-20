import React, {useContext, useMemo} from 'react';
import {SplitterContext} from './SplitterContext';

export const SplitterElement: React.FC<{
	type: 'flexer' | 'anti-flexer';
	children: React.ReactNode;
	sticky: React.ReactNode | null;
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

	return (
		<>
			<div style={style}>{children}</div>
			{sticky ?? null}
		</>
	);
};
