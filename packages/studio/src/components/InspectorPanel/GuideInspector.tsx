import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	LIGHT_TEXT,
	WHITE,
	getBackgroundFromHoverState,
} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	NO_HOVER_BACKGROUND_STYLE,
	hoverableStyle,
} from '../../helpers/hoverable';
import {noop} from '../../helpers/noop';
import {observeHover} from '../../helpers/observe-hover';
import type {Guide} from '../../state/editor-guides';
import {
	EditorShowGuidesContext,
	EditorShowGuidesRefContext,
	persistGuidesList,
} from '../../state/editor-guides';
import {ActionTooltip} from '../ActionTooltip';
import {ContextMenuForTarget} from '../ContextMenu';
import {useRemoveGuide} from '../EditorGuides/use-remove-guide';
import {InlineAction} from '../InlineAction';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {COMPACT_CONTROL_ROW_HEIGHT} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {InputDragger} from '../NewComposition/InputDragger';
import {PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR} from '../Timeline/should-clear-selection-on-pointer-down';
import {
	type TimelineSelection,
	useCurrentTimelineSelectionStateAsRef,
	useTimelineGuideSelection,
} from '../Timeline/TimelineSelection';
import {CollapsibleInspectorSectionHeader} from './CollapsibleInspectorSectionHeader';
import {
	InspectorMessage,
	InspectorSectionBody,
	InspectorSectionHeader,
} from './common';
import {detailLabel, selectedContainer} from './styles';
import {useInspectorSectionExpanded} from './use-inspector-section-expanded';

const GuideInspectorRow: React.FC<{
	readonly guide: Guide;
	readonly index: number;
	readonly onPositionDragChange: (dragging: boolean) => void;
}> = React.memo(({guide, index, onPositionDragChange}) => {
	const guidesRef = useContext(EditorShowGuidesRefContext);
	const removeGuide = useRemoveGuide();
	const {selected, onSelect} = useTimelineGuideSelection(guide.id);
	const rowRef = useRef<HTMLDivElement>(null);
	const dragStartPosition = useRef<number | null>(null);
	useEffect(() => {
		const row = rowRef.current;
		if (!row) return;
		const setHovered = (hovered: boolean) => {
			guidesRef?.current.setHoveredGuideId((current) =>
				hovered ? guide.id : current === guide.id ? null : current,
			);
		};

		const stop = observeHover({element: row, onHoverChange: setHovered});
		return () => {
			stop();
			setHovered(false);
		};
	}, [guide.id, guidesRef]);

	const updatePosition = useCallback(
		(position: number, persist: boolean) => {
			guidesRef?.current.setGuidesList((guides) => {
				const next = guides.map((candidate) =>
					candidate.id === guide.id
						? {...candidate, position: Math.round(position), show: true}
						: candidate,
				);
				if (persist) persistGuidesList(next);
				return next;
			});
		},
		[guide.id, guidesRef],
	);
	const onValueChange = useCallback(
		(value: number, source: 'input' | 'drag') => {
			if (source === 'drag') {
				if (dragStartPosition.current === null) {
					dragStartPosition.current = guide.position;
				}

				onPositionDragChange(true);
			}

			updatePosition(value, false);
		},
		[guide.position, onPositionDragChange, updatePosition],
	);
	const onValueChangeEnd = useCallback(
		(value: number) => {
			updatePosition(value, true);
			dragStartPosition.current = null;
			onPositionDragChange(false);
		},
		[onPositionDragChange, updatePosition],
	);
	const onValueChangeCancel = useCallback(() => {
		if (dragStartPosition.current !== null) {
			updatePosition(dragStartPosition.current, false);
			dragStartPosition.current = null;
		}

		onPositionDragChange(false);
	}, [onPositionDragChange, updatePosition]);
	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		return [
			{
				id: 'remove-guide',
				type: 'item',
				label: 'Remove guide',
				value: 'remove-guide',
				keyHint: null,
				leftItem: null,
				quickSwitcherLabel: null,
				subMenu: null,
				onClick: () => {
					removeGuide(guide.id);
				},
			},
		];
	}, [guide.id, removeGuide]);
	return (
		<>
			<div
				ref={rowRef}
				role="listitem"
				className={HOVERABLE_CLASS_NAME}
				{...{[PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR]: 'true'}}
				onPointerDownCapture={(event) => {
					if (event.button !== 0) return;
					onSelect();
				}}
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
					minHeight: COMPACT_CONTROL_ROW_HEIGHT,
					...hoverableStyle({
						idleBackground: getBackgroundFromHoverState({
							selected,
							hovered: false,
						}),
						hoverBackground: getBackgroundFromHoverState({
							selected,
							hovered: true,
						}),
						idleColor: selected ? WHITE : LIGHT_TEXT,
						hoverColor: WHITE,
					}),
				}}
			>
				<button
					type="button"
					data-guide-select={guide.id}
					aria-label={`${guide.orientation === 'vertical' ? 'Vertical' : 'Horizontal'} guide at ${guide.position} pixels`}
					aria-pressed={selected}
					className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
					style={{
						...detailLabel,
						color: 'inherit',
						cursor: 'default',
						border: 'none',
						background: 'transparent',
						flex: 1,
						textAlign: 'left',
						padding: '0 4px',
						marginLeft: -4,
						alignSelf: 'stretch',
					}}
					onClick={(event) => {
						if (event.detail === 0) onSelect();
					}}
				>
					Guide {index + 1}
				</button>
				<InputDragger
					aria-label={`${guide.orientation === 'vertical' ? 'X' : 'Y'} position of guide ${index + 1}`}
					onValueChangeCancel={onValueChangeCancel}
					type="number"
					value={guide.position}
					status="ok"
					onValueChange={onValueChange}
					onValueChangeEnd={onValueChangeEnd}
					onTextChange={noop}
					step={1}
					min={-Infinity}
					formatter={(value) => `${Math.round(Number(value))}px`}
					rightAlign
					small
				/>
			</div>
			<ContextMenuForTarget
				triggerRef={rowRef}
				getItems={getContextMenuItems}
			/>
		</>
	);
});

const GuideInspectorSection: React.FC<{
	readonly orientation: Guide['orientation'];
	readonly compositionId: string;
	readonly children: React.ReactNode;
}> = ({orientation, compositionId, children}) => {
	const guidesRef = useContext(EditorShowGuidesRefContext);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const [expanded, setExpanded] = useInspectorSectionExpanded(
		`${orientation}-guides`,
	);
	const onAddGuide = useCallback(() => {
		const state = guidesRef?.current;
		if (!state) return;
		const id = crypto.randomUUID();
		state.setGuidesList((guides) => {
			const positions = new Set(
				guides
					.filter(
						(guide) =>
							guide.compositionId === compositionId &&
							guide.orientation === orientation,
					)
					.map((guide) => guide.position),
			);
			let position = 0;
			while (positions.has(position)) position += 100;
			const next = [
				...guides,
				{id, orientation, compositionId, position, show: true},
			];
			persistGuidesList(next);
			return next;
		});
		state.setEditorShowGuides(() => true);
		setExpanded(true);
		currentSelection.current.selectItems([{type: 'guide', guideId: id}]);
	}, [compositionId, currentSelection, guidesRef, orientation, setExpanded]);
	const label = `${orientation === 'vertical' ? 'Vertical' : 'Horizontal'} guides`;
	return (
		<>
			<InspectorSectionHeader>
				<CollapsibleInspectorSectionHeader
					expanded={expanded}
					label={label}
					onToggle={() => setExpanded(!expanded)}
					action={
						<ActionTooltip
							label={`Add ${orientation} guide`}
							shortcut={null}
							delay={800}
							dismissOnClick
						>
							<InlineAction
								variant={null}
								onClick={onAddGuide}
								aria-label={`Add ${orientation} guide`}
								className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
								{...{[PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR]: 'true'}}
								style={{
									...NO_HOVER_BACKGROUND_STYLE,
									marginRight: -6,
									cursor: 'default',
								}}
								renderAction={(color) => (
									<svg
										viewBox="0 0 12 12"
										style={{flexShrink: 0, height: 12, width: 12}}
									>
										<path
											d="M6 1.25v9.5M1.25 6h9.5"
											fill="none"
											stroke={color}
											strokeWidth="1"
											strokeLinecap="round"
										/>
									</svg>
								)}
							/>
						</ActionTooltip>
					}
				/>
			</InspectorSectionHeader>
			<InspectorSectionBody expanded={expanded} keepMounted paddingBottom={8}>
				{children}
			</InspectorSectionBody>
		</>
	);
};

export const GuideInspector: React.FC<{
	readonly selection: Extract<TimelineSelection, {type: 'guide'}>;
}> = ({selection}) => {
	const {guidesList, draggingGuideId} = useContext(EditorShowGuidesContext);
	const [isPositionDragging, setIsPositionDragging] = useState(false);
	const isDragging = draggingGuideId !== null || isPositionDragging;
	const sortOrder = useRef<{
		compositionId: string | null;
		guideIds: string[];
	}>({compositionId: null, guideIds: []});
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	const selectedGuide = guidesList.find(
		(guide) => guide.id === selection.guideId,
	);
	const compositionId = selectedGuide?.compositionId ?? null;
	const orderedGuides = useMemo(() => {
		const guides = guidesList.filter(
			(guide) =>
				guide.compositionId === compositionId &&
				(guide.show || guide.id === draggingGuideId),
		);
		if (!isDragging || sortOrder.current.compositionId !== compositionId) {
			return guides.sort((a, b) => a.position - b.position);
		}

		const indexes = new Map(
			sortOrder.current.guideIds.map((id, index) => [id, index]),
		);
		return guides.sort(
			(a, b) =>
				(indexes.get(a.id) ?? Infinity) - (indexes.get(b.id) ?? Infinity) ||
				a.position - b.position,
		);
	}, [compositionId, draggingGuideId, guidesList, isDragging]);
	useLayoutEffect(() => {
		if (!isDragging || sortOrder.current.compositionId !== compositionId) {
			sortOrder.current = {
				compositionId,
				guideIds: orderedGuides.map((guide) => guide.id),
			};
		}
	}, [compositionId, isDragging, orderedGuides]);
	const sections = useMemo(() => {
		return (['vertical', 'horizontal'] as const).map((orientation) => ({
			orientation,
			guides: orderedGuides.filter(
				(guide) => guide.orientation === orientation,
			),
		}));
	}, [orderedGuides]);

	if (!selectedGuide)
		return <InspectorMessage>Guide unavailable</InspectorMessage>;

	return (
		<div style={selectedContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			{sections.map(({orientation, guides}) => (
				<GuideInspectorSection
					key={orientation}
					orientation={orientation}
					compositionId={selectedGuide.compositionId}
				>
					<div
						role="list"
						aria-label={`${orientation === 'vertical' ? 'Vertical' : 'Horizontal'} guides`}
						onKeyDown={(event) => {
							const {target} = event;
							if (
								!(target instanceof HTMLButtonElement) ||
								!target.dataset.guideSelect
							)
								return;
							if (
								(event.metaKey || event.ctrlKey) &&
								event.key.toLowerCase() === 'a'
							) {
								event.preventDefault();
								event.stopPropagation();
								return;
							}

							if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
								return;
							event.preventDefault();
							event.stopPropagation();
							const index = guides.findIndex(
								(guide) => guide.id === target.dataset.guideSelect,
							);
							const nextIndex =
								event.key === 'Home'
									? 0
									: event.key === 'End'
										? guides.length - 1
										: Math.max(
												0,
												Math.min(
													guides.length - 1,
													index + (event.key === 'ArrowUp' ? -1 : 1),
												),
											);
							const next = guides[nextIndex];
							currentSelection.current.selectItem({
								type: 'guide',
								guideId: next.id,
							});
							event.currentTarget
								.querySelectorAll<HTMLButtonElement>('[data-guide-select]')
								[nextIndex]?.focus();
						}}
					>
						{guides.map((guide, index) => (
							<GuideInspectorRow
								key={guide.id}
								guide={guide}
								index={index}
								onPositionDragChange={setIsPositionDragging}
							/>
						))}
					</div>
				</GuideInspectorSection>
			))}
		</div>
	);
};
