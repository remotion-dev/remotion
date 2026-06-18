import {memo, useCallback, useContext, useMemo, useRef} from 'react';
import {NoReactInternals} from 'remotion/no-react';
import {
	getEditorGuideColor,
	isGuidePointerUpAClick,
	type GuidePointerDownPosition,
} from '../../helpers/editor-guide-selection';
import type {Guide} from '../../state/editor-guides';
import {
	EditorShowGuidesContext,
	persistGuidesList,
} from '../../state/editor-guides';
import {RULER_WIDTH} from '../../state/editor-rulers';
import {ContextMenu} from '../ContextMenu';
import {stopForcingSpecificCursor} from '../ForceSpecificCursor';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR} from '../Timeline/should-clear-selection-on-pointer-down';
import {useTimelineGuideSelection} from '../Timeline/TimelineSelection';

const PADDING_FOR_EASY_DRAG = 4;

const GuideComp: React.FC<{
	guide: Guide;
	canvasDimensions: {
		left: number;
		top: number;
		width: number;
		height: number;
	};
	scale: number;
}> = ({guide, canvasDimensions, scale}) => {
	const {
		shouldCreateGuideRef,
		shouldDeleteGuideRef,
		setGuidesList,
		setDraggingGuideId,
		setHoveredGuideId,
		hoveredGuideId,
		draggingGuideId,
	} = useContext(EditorShowGuidesContext);
	const {clearSelection, onSelect, selected} = useTimelineGuideSelection(
		guide.id,
	);
	const pointerDownPositionRef = useRef<GuidePointerDownPosition | null>(null);
	const hasMovedGuideRef = useRef(false);

	const onPointerEnter = useCallback(() => {
		setHoveredGuideId(() => guide.id);
	}, [guide.id, setHoveredGuideId]);

	const onPointerLeave = useCallback(() => {
		setHoveredGuideId(() => null);
	}, [setHoveredGuideId]);

	const isVerticalGuide = guide.orientation === 'vertical';

	const guideStyle: React.CSSProperties = useMemo(() => {
		const canvasPosition = isVerticalGuide
			? canvasDimensions.left
			: canvasDimensions.top;
		const guidePosition = guide.position * scale + canvasPosition;
		return {
			position: 'absolute',
			width: `${isVerticalGuide ? '1px' : '100%'}`,
			height: `${isVerticalGuide ? '100%' : '1px'}`,
			left: `${isVerticalGuide ? guidePosition - PADDING_FOR_EASY_DRAG : 0}px`,
			top: `${isVerticalGuide ? 0 : guidePosition - PADDING_FOR_EASY_DRAG}px`,
			cursor: `${isVerticalGuide ? 'ew-resize' : 'ns-resize'}`,
			padding: isVerticalGuide
				? `0 ${PADDING_FOR_EASY_DRAG}px`
				: `${PADDING_FOR_EASY_DRAG}px 0`,
		};
	}, [guide, scale, canvasDimensions, isVerticalGuide]);

	const guideContentStyle: React.CSSProperties = useMemo(() => {
		return {
			position: 'relative',
			minWidth: `${isVerticalGuide ? '1px' : `calc(100% + ${RULER_WIDTH}px`}`,
			minHeight: `${isVerticalGuide ? `calc(100% + ${RULER_WIDTH}px` : '1px'}`,
			top: `${isVerticalGuide ? `-${RULER_WIDTH}px` : '0px'}`,
			left: `${isVerticalGuide ? '0px' : `-${RULER_WIDTH}px`}`,
			display: guide.show ? 'block' : 'none',
			backgroundColor: getEditorGuideColor({
				selected,
				active: hoveredGuideId === guide.id || draggingGuideId === guide.id,
			}),
		};
	}, [
		isVerticalGuide,
		guide.show,
		hoveredGuideId,
		guide.id,
		selected,
		draggingGuideId,
	]);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			e.stopPropagation();
			e.currentTarget.setPointerCapture(e.pointerId);
			hasMovedGuideRef.current = false;
			pointerDownPositionRef.current = {
				guideId: guide.id,
				clientX: e.clientX,
				clientY: e.clientY,
			};
			shouldCreateGuideRef.current = false;
			setDraggingGuideId(() => guide.id);
		},
		[guide.id, setDraggingGuideId, shouldCreateGuideRef],
	);

	const onMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			if (e.button !== 0) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			hasMovedGuideRef.current = false;
			pointerDownPositionRef.current = {
				guideId: guide.id,
				clientX: e.clientX,
				clientY: e.clientY,
			};
			shouldCreateGuideRef.current = false;
			setDraggingGuideId(() => guide.id);
		},
		[guide.id, setDraggingGuideId, shouldCreateGuideRef],
	);

	const updateHasMovedGuide = useCallback(
		(clientX: number, clientY: number) => {
			const pointerDownPosition = pointerDownPositionRef.current;
			if (pointerDownPosition === null) {
				return;
			}

			if (
				!isGuidePointerUpAClick({
					pointerDownPosition,
					guideId: guide.id,
					clientX,
					clientY,
				})
			) {
				hasMovedGuideRef.current = true;
			}
		},
		[guide.id],
	);

	const onPointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			updateHasMovedGuide(e.clientX, e.clientY);
		},
		[updateHasMovedGuide],
	);

	const onMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			updateHasMovedGuide(e.clientX, e.clientY);
		},
		[updateHasMovedGuide],
	);

	const finishGuideInteraction = useCallback(() => {
		const shouldDeleteGuide = shouldDeleteGuideRef.current;

		setGuidesList((prevState) => {
			const newGuides = shouldDeleteGuide
				? prevState.filter((candidate) => candidate.id !== guide.id)
				: prevState;
			persistGuidesList(newGuides);
			return newGuides;
		});

		if (shouldDeleteGuide && selected) {
			clearSelection();
		}

		shouldDeleteGuideRef.current = false;
		shouldCreateGuideRef.current = false;
		stopForcingSpecificCursor();
		setDraggingGuideId(() => null);
	}, [
		clearSelection,
		guide.id,
		selected,
		setDraggingGuideId,
		setGuidesList,
		shouldCreateGuideRef,
		shouldDeleteGuideRef,
	]);

	const onPointerUp = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.currentTarget.hasPointerCapture(e.pointerId)) {
				e.currentTarget.releasePointerCapture(e.pointerId);
			}

			const pointerDownPosition = pointerDownPositionRef.current;
			pointerDownPositionRef.current = null;
			const shouldDeleteGuide = shouldDeleteGuideRef.current;
			finishGuideInteraction();
			if (shouldDeleteGuide) {
				return;
			}

			if (
				isGuidePointerUpAClick({
					pointerDownPosition,
					guideId: guide.id,
					clientX: e.clientX,
					clientY: e.clientY,
				})
			) {
				onSelect();
			}
		},
		[finishGuideInteraction, guide.id, onSelect, shouldDeleteGuideRef],
	);

	const onMouseUp = useCallback(
		(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			const pointerDownPosition = pointerDownPositionRef.current;
			pointerDownPositionRef.current = null;
			const shouldDeleteGuide = shouldDeleteGuideRef.current;
			finishGuideInteraction();
			if (shouldDeleteGuide) {
				return;
			}

			if (
				isGuidePointerUpAClick({
					pointerDownPosition,
					guideId: guide.id,
					clientX: e.clientX,
					clientY: e.clientY,
				})
			) {
				onSelect();
			}
		},
		[finishGuideInteraction, guide.id, onSelect, shouldDeleteGuideRef],
	);

	const onClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			if (e.button !== 0) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();
		},
		[],
	);

	const onPointerCancel = useCallback(() => {
		pointerDownPositionRef.current = null;
		finishGuideInteraction();
	}, [finishGuideInteraction]);

	const isActive = selected || hoveredGuideId === guide.id;
	const activeClassName = isActive ? '__remotion_editor_guide_selected' : null;

	const guideClassName = useMemo(() => {
		return ['__remotion_editor_guide_content', activeClassName]
			.filter(NoReactInternals.truthy)
			.join(' ');
	}, [activeClassName]);

	const values = useMemo((): ComboboxValue[] => {
		return [
			{
				id: '1',
				keyHint: null,
				label: 'Remove guide',
				leftItem: null,
				onClick: () => {
					setGuidesList((prevState) => {
						const newGuides = prevState.filter((candidate) => {
							return candidate.id !== guide.id;
						});
						persistGuidesList(newGuides);
						return newGuides;
					});
					if (selected) {
						clearSelection();
					}
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'remove',
			},
		];
	}, [clearSelection, guide.id, selected, setGuidesList]);

	return (
		<ContextMenu values={values} onOpen={null}>
			<div
				style={guideStyle}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerCancel}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
				onClick={onClick}
				className="__remotion_editor_guide"
				{...{[PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR]: 'true'}}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
			>
				<div style={guideContentStyle} className={guideClassName} />
			</div>
		</ContextMenu>
	);
};

export default memo(GuideComp);
