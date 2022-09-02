import React, {useContext, useMemo} from 'react';
import {SplitterContext} from './SplitterContext';

export const SplitterElement: React.FC<{
	type: 'flexer' | 'anti-flexer';
	children: React.ReactNode;
}> = ({children, type}) => {
	const context = useContext(SplitterContext);

	const style: React.CSSProperties = useMemo(() => {
		return {
			flex:
				// Multiply by 1000 because if flex values don't add up to at least 1, they will not fill up the screen
				(type === 'flexer' ? context.flexValue : 1 - context.flexValue) * 1000,
			display: 'flex',
			position: 'relative',
			overflow: 'hidden',
		};
	}, [context.flexValue, type]);

	return <div style={style}>{children}</div>;
};
