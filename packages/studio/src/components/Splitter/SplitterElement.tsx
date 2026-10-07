import React, {useContext, useLayoutEffect, useMemo, useRef} from 'react';
import {SplitterContext, SplitterLayoutContext} from './SplitterContext';

export const SplitterElement: React.FC<{
	readonly type: 'flexer' | 'anti-flexer';
	readonly children: React.ReactNode;
	readonly sticky: React.ReactNode | null;
}> = ({children, type, sticky}) => {
	const context = useContext(SplitterContext);
	const layout = useContext(SplitterLayoutContext);
	const panelRef = useRef<HTMLDivElement>(null);
	const stickyRef = useRef<HTMLDivElement>(null);
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

	useLayoutEffect(() => {
		const panel = panelRef.current;
		const overlay = stickyRef.current;
		const offsetParent = overlay?.offsetParent;
		if (!panel || !overlay || !(offsetParent instanceof HTMLElement)) {
			return;
		}

		const update = () => {
			const panelRect = panel.getBoundingClientRect();
			const parentRect = offsetParent.getBoundingClientRect();
			// Keep the overlay outside the scrolling panel, while matching its
			// actual bounds, including the divider and scrollbar widths.
			overlay.style.left = `${panelRect.left - parentRect.left - offsetParent.clientLeft + offsetParent.scrollLeft}px`;
			overlay.style.width = `${panelRect.width}px`;
		};

		update();
		const observer = new ResizeObserver(update);
		observer.observe(panel);
		return () => observer.disconnect();
	}, [layout, sticky, style]);

	return (
		<>
			<div ref={panelRef} style={style}>
				{children}
			</div>
			{sticky === null ? null : (
				<div ref={stickyRef} style={{position: 'absolute'}}>
					{sticky}
				</div>
			)}
		</>
	);
};
