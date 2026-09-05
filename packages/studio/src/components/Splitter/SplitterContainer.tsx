import {PlayerInternals} from '@remotion/player';
import React, {
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {drawRef, RefreshCanvasSizeContext} from '../../state/canvas-ref';
import {useTimelineFlex} from '../../state/timeline';
import type {
	SplitterDragState,
	SplitterOrientation,
	TSplitterContext,
} from './SplitterContext';
import {
	getClampedSplitterFlex,
	SplitterContext,
	SplitterLayoutContext,
} from './SplitterContext';
import {SPLITTER_HANDLE_SIZE} from './SplitterHandle';

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
	readonly maxFlexerSize: number | null;
	readonly minFlexerSize: number | null;
	readonly maxAntiFlexerSize: number | null;
	readonly minAntiFlexerSize: number | null;
	readonly id: string;
	readonly defaultFlex: number;
	readonly children: React.ReactNode;
}> = ({
	orientation,
	children,
	defaultFlex,
	maxFlex,
	minFlex,
	maxFlexerSize,
	minFlexerSize,
	maxAntiFlexerSize,
	minAntiFlexerSize,
	id,
}) => {
	const parentLayout = useContext(SplitterLayoutContext);
	const refreshCanvas = useContext(RefreshCanvasSizeContext);
	const [initialTimelineFlex, persistFlex] = useTimelineFlex(id);
	const [flexValue, setFlexValue] = useState(
		initialTimelineFlex ?? defaultFlex,
	);

	const [collapsedDuringDrag, setCollapsedDuringDrag] = useState<
		'left' | 'right' | null
	>(null);

	const ref = useRef<HTMLDivElement>(null);
	const isDragging = useRef<SplitterDragState>(false);
	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const availableSize = size
		? (orientation === 'vertical' ? size.width : size.height) -
			SPLITTER_HANDLE_SIZE
		: null;
	const effectiveFlexValue = getClampedSplitterFlex({
		availableSize,
		flexValue,
		maxAntiFlexerSize,
		maxFlex,
		maxFlexerSize,
		minAntiFlexerSize,
		minFlex,
		minFlexerSize,
	});

	const value: TSplitterContext = useMemo(() => {
		return {
			flexValue: effectiveFlexValue,
			collapsedDuringDrag,
			setCollapsedDuringDrag,
			ref,
			setFlexValue,
			isDragging,
			orientation,
			id,
			maxFlex,
			minFlex,
			maxFlexerSize,
			minFlexerSize,
			maxAntiFlexerSize,
			minAntiFlexerSize,
			defaultFlex,
			persistFlex,
		};
	}, [
		defaultFlex,
		collapsedDuringDrag,
		effectiveFlexValue,
		id,
		maxFlex,
		maxFlexerSize,
		minFlexerSize,
		maxAntiFlexerSize,
		minAntiFlexerSize,
		minFlex,
		orientation,
		persistFlex,
		ref,
	]);

	const childCount = React.Children.toArray(children).length;
	const layout = useMemo(
		() => ({
			parentLayout,
			effectiveFlexValue,
			collapsedDuringDrag,
			orientation,
			width: size?.width,
			height: size?.height,
			childCount,
		}),
		[
			parentLayout,
			effectiveFlexValue,
			collapsedDuringDrag,
			orientation,
			size?.width,
			size?.height,
			childCount,
		],
	);
	const refreshSize = size?.refresh;

	useLayoutEffect(() => {
		// Remeasure only this splitter and its canvas before the layout paints.
		refreshSize?.();
		if (drawRef.current && ref.current?.contains(drawRef.current)) {
			refreshCanvas?.();
		}
	}, [layout, refreshSize, refreshCanvas]);

	return (
		<SplitterLayoutContext.Provider value={layout}>
			<SplitterContext.Provider value={value}>
				<div
					ref={ref}
					style={orientation === 'horizontal' ? containerColumn : containerRow}
				>
					{children}
				</div>
			</SplitterContext.Provider>
		</SplitterLayoutContext.Provider>
	);
};
