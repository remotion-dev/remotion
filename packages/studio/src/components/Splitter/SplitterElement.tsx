import React, {useContext, useMemo} from 'react';
import {SplitterContext} from './SplitterContext';

export const SplitterElement: React.FC<{
	readonly type: 'flexer' | 'anti-flexer';
	readonly children: React.ReactNode;
}> = ({children, type}) => {
	const context = useContext(SplitterContext);
	const maxSize =
		type === 'flexer' ? context.maxFlexerSize : context.maxAntiFlexerSize;
	const minSize =
		type === 'flexer' ? context.minFlexerSize : context.minAntiFlexerSize;

	const style: React.CSSProperties = useMemo(() => {
		return {
			flex:
				// Multiply by 1000 because if flex values don't add up to at least 1, they will not fill up the screen
				(type === 'flexer' ? context.flexValue : 1 - context.flexValue) * 1000,
			display:
				context.collapsedDuringDrag === (type === 'flexer' ? 'left' : 'right')
					? 'none'
					: 'flex',
			position: 'relative',
			overflow: 'hidden',
			flexDirection: 'column',
			maxWidth:
				context.orientation === 'vertical' ? (maxSize ?? undefined) : undefined,
			maxHeight:
				context.orientation === 'horizontal'
					? (maxSize ?? undefined)
					: undefined,
			minWidth:
				context.orientation === 'vertical' ? (minSize ?? undefined) : undefined,
			minHeight:
				context.orientation === 'horizontal'
					? (minSize ?? undefined)
					: undefined,
		};
	}, [
		context.collapsedDuringDrag,
		context.flexValue,
		context.orientation,
		maxSize,
		minSize,
		type,
	]);

	return <div style={style}>{children}</div>;
};
