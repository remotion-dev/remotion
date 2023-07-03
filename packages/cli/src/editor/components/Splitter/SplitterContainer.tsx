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
};

const containerColumn: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	height: '100%',
};

export const SplitterContainer: React.FC<{
	orientation: SplitterOrientation;
	maxFlex: number;
	minFlex: number;
	id: string;
	defaultFlex: number;
	children: React.ReactNode;
}> = ({orientation, children, defaultFlex, maxFlex, minFlex, id}) => {
	const [initialTimelineFlex, persistFlex] = useTimelineFlex(id);
	const [flexValue, setFlexValue] = useState(
		initialTimelineFlex ?? defaultFlex
	);

	const [domRect, setDomRect] = useState<DOMRect | DOMRectReadOnly | null>(
		null
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
