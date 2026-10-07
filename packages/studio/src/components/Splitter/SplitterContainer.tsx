import {PlayerInternals} from '@remotion/player';
import React, {
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {useTimelineFlex} from '../../state/timeline';
import type {
	SplitterDragState,
	SplitterOrientation,
	TSplitterContext,
} from './SplitterContext';
import {
	getSplitterFlexBounds,
	SplitterContext,
	SplitterLayoutContext,
	SplitterOriginContext,
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
	// Pointer handlers read the latest measurement without subscribing panes
	// to changes in the measurement object or its window-size metadata.
	const sizeRef = useRef(size);
	sizeRef.current = size;
	const availableSize = size
		? (orientation === 'vertical' ? size.width : size.height) -
			SPLITTER_HANDLE_SIZE
		: null;
	const flexBounds = getSplitterFlexBounds({
		availableSize,
		maxAntiFlexerSize,
		maxFlex,
		maxFlexerSize,
		minAntiFlexerSize,
		minFlex,
		minFlexerSize,
	});
	let effectiveFlexValue = Math.min(
		flexBounds.maxFlex,
		Math.max(flexBounds.minFlex, flexValue),
	);
	if (availableSize !== null && availableSize > 0) {
		// Keep panel boundaries on whole pixels so toolbar icons stay crisp.
		const minimumSize = Math.ceil(flexBounds.minFlex * availableSize);
		const maximumSize = Math.floor(flexBounds.maxFlex * availableSize);
		if (minimumSize <= maximumSize) {
			effectiveFlexValue =
				Math.min(
					maximumSize,
					Math.max(minimumSize, Math.round(flexValue * availableSize)),
				) / availableSize;
		}
	}

	const value: TSplitterContext = useMemo(() => {
		return {
			flexValue: effectiveFlexValue,
			collapsedDuringDrag,
			setCollapsedDuringDrag,
			sizeRef,
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
		sizeRef,
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
			left: size?.left,
			top: size?.top,
			childCount,
		}),
		[
			parentLayout,
			effectiveFlexValue,
			collapsedDuringDrag,
			orientation,
			size?.width,
			size?.height,
			size?.left,
			size?.top,
			childCount,
		],
	);
	const refreshSize = size?.refresh;

	useLayoutEffect(() => {
		// The observer handles this container's size. Refresh its position when
		// an ancestor changes layout, including when a sidebar is removed.
		refreshSize?.();
	}, [parentLayout, childCount, refreshSize]);

	return (
		<SplitterOriginContext.Provider value={size?.left ?? null}>
			<SplitterLayoutContext.Provider value={layout}>
				<SplitterContext.Provider value={value}>
					<div
						ref={ref}
						style={
							orientation === 'horizontal' ? containerColumn : containerRow
						}
					>
						{children}
					</div>
				</SplitterContext.Provider>
			</SplitterLayoutContext.Provider>
		</SplitterOriginContext.Provider>
	);
};
