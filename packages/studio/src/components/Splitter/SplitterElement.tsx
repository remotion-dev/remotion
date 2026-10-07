import React, {useContext, useMemo} from 'react';
import {SplitterContext} from './SplitterContext';

const stickyStyle: React.CSSProperties = {
	position: 'sticky',
	top: 0,
	height: 0,
	flexShrink: 0,
	zIndex: 1,
};

export const SplitterElement: React.FC<{
	readonly type: 'flexer' | 'anti-flexer';
	readonly children: React.ReactNode;
	readonly sticky: React.ReactNode | null;
}> = ({children, type, sticky}) => {
	const context = useContext(SplitterContext);
	const hasSticky = sticky !== null;
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
			// Clip the overlay without making this panel the sticky scrollport.
			overflow: hasSticky ? 'clip' : 'hidden',
			flexDirection: 'column',
			maxWidth:
				context.orientation === 'vertical' ? (maxSize ?? undefined) : undefined,
			maxHeight:
				context.orientation === 'horizontal'
					? (maxSize ?? undefined)
					: undefined,
			minWidth: context.orientation === 'vertical' ? (minSize ?? 0) : 0,
			minHeight:
				context.orientation === 'horizontal'
					? (minSize ?? undefined)
					: undefined,
		};
	}, [
		context.collapsedDuringDrag,
		context.flexValue,
		context.orientation,
		hasSticky,
		maxSize,
		minSize,
		type,
	]);

	return (
		<div style={style}>
			{hasSticky ? (
				// Share the panel's actual width while staying pinned to the
				// timeline's vertical scrollport.
				<div style={stickyStyle}>{sticky}</div>
			) : null}
			{children}
		</div>
	);
};
