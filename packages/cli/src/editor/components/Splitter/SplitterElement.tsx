import React, {useContext, useMemo} from 'react';
import {SplitterContext} from './SplitterContext';

export const SplitterElement: React.FC<{
	type: 'flexer' | 'anti-flexer';
}> = ({children, type}) => {
	const context = useContext(SplitterContext);

	const style: React.CSSProperties = useMemo(() => {
		return {
			flex: type === 'flexer' ? context.flexValue : 1 - context.flexValue,
			display: 'flex',
			position: 'relative',
		};
	}, [context.flexValue, type]);

	return <div style={style}>{children}</div>;
};
