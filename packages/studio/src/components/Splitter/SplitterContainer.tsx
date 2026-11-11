import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {flushSync} from 'react-dom';
import {useTimelineFlex} from '../../state/timeline';
import type {
	SplitterDragState,
	SplitterOrientation,
	TSplitterContext,
} from './SplitterContext';
import {
	getEffectiveSplitterFlex,
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
	const [initialTimelineFlex, persistFlex] = useTimelineFlex(id);
	const [flexValue, setFlexValueState] = useState(
		initialTimelineFlex ?? defaultFlex,
	);
	const flexValueRef = useRef(flexValue);
	const setFlexValue: TSplitterContext['setFlexValue'] = useCallback((next) => {
		const updated =
			typeof next === 'function' ? next(flexValueRef.current) : next;
		flexValueRef.current = updated;
		setFlexValueState(updated);
	}, []);
	const [firstPaneId] = useState(
		() => `remotion-splitter-pane-${String(Math.random()).slice(2)}`,
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
	const bounds = {
		availableSize,
		maxAntiFlexerSize,
		maxFlex,
		maxFlexerSize,
		minAntiFlexerSize,
		minFlex,
		minFlexerSize,
	};
	const {flexValue: effectiveFlexValue, position} = getEffectiveSplitterFlex({
		...bounds,
		flexValue,
	});
	const latest = useRef({bounds, orientation, persistFlex});
	latest.current = {bounds, orientation, persistFlex};

	const getLayout = useCallback((positionInPixels: number | null) => {
		const element = ref.current;
		if (!element?.isConnected) {
			return null;
		}

		const {width, height} = element.getBoundingClientRect();
		const liveSize =
			(latest.current.orientation === 'vertical' ? width : height) -
			SPLITTER_HANDLE_SIZE;
		if (liveSize <= 0) {
			return null;
		}

		return getEffectiveSplitterFlex({
			...latest.current.bounds,
			availableSize: liveSize,
			flexValue:
				positionInPixels === null
					? flexValueRef.current
					: positionInPixels / liveSize,
		});
	}, []);
	const getPosition = useCallback(
		() => getLayout(null)?.position ?? null,
		[getLayout],
	);
	const setPosition = useCallback(
		(positionInPixels: number) => {
			if (!Number.isFinite(positionInPixels)) {
				throw new Error('Splitter position must be a finite number.');
			}

			if (isDragging.current) {
				throw new Error('The splitter is being dragged.');
			}

			const nextLayout = getLayout(positionInPixels);
			if (nextLayout === null || nextLayout.position === null) {
				throw new Error('Splitter is unavailable.');
			}

			flushSync(() => setFlexValue(nextLayout.flexValue));
			latest.current.persistFlex(nextLayout.flexValue);
			return nextLayout.position;
		},
		[getLayout, setFlexValue],
	);

	const value: TSplitterContext = useMemo(() => {
		return {
			flexValue: effectiveFlexValue,
			position,
			collapsedDuringDrag,
			setCollapsedDuringDrag,
			ref,
			setFlexValue,
			isDragging,
			orientation,
			id,
			firstPaneId,
			getPosition,
			setPosition,
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
		firstPaneId,
		getPosition,
		setPosition,
		setFlexValue,
		id,
		maxFlex,
		maxFlexerSize,
		minFlexerSize,
		maxAntiFlexerSize,
		minAntiFlexerSize,
		minFlex,
		orientation,
		persistFlex,
		position,
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
		// Remeasure this splitter when its own or an ancestor's layout changes.
		refreshSize?.();
	}, [layout, refreshSize]);

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
