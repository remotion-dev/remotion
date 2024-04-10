import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTimelineFlex} from '../../state/timeline';
import type {
	SplitterDragState,
	SplitterOrientation,
	TSplitterContext,
} from './SplitterContext';
import {SplitterContext} from './SplitterContext';

const containerRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	flex: 1,
	height: '100%',
	width: '100%',
};

export const containerColumn: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	height: 0,
};

export const SplitterContainer: React.FC<{
	readonly orientation: SplitterOrientation;
	readonly maxFlex: number;
	readonly minFlex: number;
	readonly id: string;
	readonly defaultFlex: number;
	readonly children: React.ReactNode;
}> = ({orientation, children, defaultFlex, maxFlex, minFlex, id}) => {
	const [initialTimelineFlex, persistFlex] = useTimelineFlex(id);
	const [flexValue, setFlexValue] = useState(
		initialTimelineFlex ?? defaultFlex,
	);

	const [domRect, setDomRect] = useState<DOMRect | DOMRectReadOnly | null>(
		null,
	);
	const ref = useRef<HTMLDivElement>(null);
	const isDragging = useRef<SplitterDragState>(false);

	const [resizeObserver] = useState(() => {
		return new ResizeObserver((entries) => {
			setDomRect(entries[0].contentRect);
		});
	});

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		resizeObserver.observe(current);
		return () => resizeObserver.unobserve(current);
	}, [resizeObserver]);

	useEffect(() => {
		setDomRect(ref.current?.getBoundingClientRect() ?? null);
	}, []);

	const value: TSplitterContext = useMemo(() => {
		return {
			flexValue,
			domRect,
			setFlexValue,
			isDragging,
			orientation,
			id,
			maxFlex,
			minFlex,
			defaultFlex,
			persistFlex,
		};
	}, [
		defaultFlex,
		domRect,
		flexValue,
		id,
		maxFlex,
		minFlex,
		orientation,
		persistFlex,
	]);

	return (
		<SplitterContext.Provider value={value}>
			<div
				ref={ref}
				style={orientation === 'horizontal' ? containerColumn : containerRow}
			>
				{children}
			</div>
		</SplitterContext.Provider>
	);
};
