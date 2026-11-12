import type {DefaultCodingAgent} from '@remotion/renderer';
import type {EditorPickerId} from '@remotion/studio-shared';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {
	SequencePropsSubscriptionKey,
	InteractivitySchema,
	EffectDefinition,
} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {canUseEffectOperations} from '../../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {TIMELINE_BLUE, WHITE_ALPHA_80} from '../../helpers/colors';
import {
	formatContextForAgents,
	formatFileLocation,
} from '../../helpers/format-file-location';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	openInCodingAgent as openCodingAgent,
	openSourceInEditor,
} from '../../helpers/open-in-editor';
import {getProjectedEffectPropStatuses} from '../../helpers/optimistic-effect-projection';
import {
	EXPANDED_SECTION_PADDING_RIGHT,
	TREE_GROUP_ROW_HEIGHT,
} from '../../helpers/timeline-layout';
import {ContextMenu} from '../ContextMenu';
import {reorderEffect} from '../effect-operations-api';
import type {GetIsExpanded} from '../ExpandedTracksProvider';
import {getAnnotateWithChatGPTMenuItems} from '../get-annotate-with-chatgpt-menu-item';
import {getSourceContextMenuItems} from '../get-source-context-menu-items';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {useSettings} from '../SettingsContext';
import {useOpenInMenuApps} from '../use-open-in-menu-apps';
import {useDeleteEffects} from './delete-effects-from-source';
import {duplicateEffectsFromSource} from './duplicate-selected-timeline-item';
import {getCopyContextForAgentsMenuItem} from './get-copy-context-for-agents-menu-item';
import {saveEffectProp} from './save-effect-prop';
import {
	TimelineExpandArrowButton,
	TimelineExpandArrowSpacer,
} from './TimelineExpandArrowButton';
import {TimelineLayerEye, TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineRowChrome} from './TimelineRowChrome';
import {
	getTimelineColor,
	getTimelineSelectedLabelStyle,
	TIMELINE_SELECTED_LABEL_BACKGROUND,
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
} from './TimelineSelection';

const EFFECT_REORDER_MIME_TYPE = 'application/remotion-effect-reorder';

type EffectReorderDragData = {
	readonly nodePathKey: string;
	readonly effectIndex: number;
};

let currentEffectDrag: EffectReorderDragData | null = null;

type EffectDropTarget = {
	element: HTMLDivElement;
	beforeElement: HTMLDivElement | null;
	setIndicator: (indicator: 'before' | 'after' | null) => void;
};

const EffectReorderTargetsContext = createContext<Map<
	number,
	EffectDropTarget
> | null>(null);

export const EffectReorderTargetsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [targets] = useState(() => new Map<number, EffectDropTarget>());
	return (
		<EffectReorderTargetsContext.Provider value={targets}>
			<div
				style={{display: 'contents'}}
				onDragLeave={(event) => handleEffectDragLeave(event, targets)}
			>
				{children}
			</div>
		</EffectReorderTargetsContext.Provider>
	);
};

let activeEffectDropTarget: {
	target: EffectDropTarget;
	scope: Map<number, EffectDropTarget>;
} | null = null;

const clearEffectDropIndicator = () => {
	activeEffectDropTarget?.target.setIndicator(null);
	activeEffectDropTarget = null;
};

const handleEffectDragLeave = (
	e: React.DragEvent<HTMLDivElement> | DragEvent,
	targets: Map<number, EffectDropTarget>,
) => {
	const {currentTarget, relatedTarget} = e;
	if (
		relatedTarget instanceof Node &&
		((currentTarget instanceof Node && currentTarget.contains(relatedTarget)) ||
			Array.from(targets.values()).some(
				({element, beforeElement}) =>
					element.contains(relatedTarget) ||
					beforeElement?.contains(relatedTarget),
			))
	) {
		return;
	}

	if (activeEffectDropTarget?.scope === targets) {
		clearEffectDropIndicator();
	}
};

const rowLabel: React.CSSProperties = {
	fontSize: 12,
	color: WHITE_ALPHA_80,
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const rowStyle: React.CSSProperties = {
	height: TREE_GROUP_ROW_HEIGHT,
	cursor: 'default',
};

const labelContainerStyle: React.CSSProperties = {
	alignItems: 'center',
	alignSelf: 'stretch',
	display: 'flex',
	flex: 1,
	minWidth: 0,
	paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
};

const reorderWrapper: React.CSSProperties = {
	position: 'relative',
};

const reorderLineBase: React.CSSProperties = {
	backgroundColor: TIMELINE_BLUE,
	height: 2,
	left: 0,
	pointerEvents: 'none',
	position: 'absolute',
	right: 0,
	zIndex: 1,
};

const hasEffectReorderDragType = (dataTransfer: DataTransfer) => {
	return Array.from(dataTransfer.types).includes(EFFECT_REORDER_MIME_TYPE);
};

const getEffectReorderDragData = (
	dataTransfer: DataTransfer,
): EffectReorderDragData | null => {
	if (currentEffectDrag) {
		return currentEffectDrag;
	}

	const value = dataTransfer.getData(EFFECT_REORDER_MIME_TYPE);
	if (!value) {
		return null;
	}

	try {
		const parsed = JSON.parse(value) as EffectReorderDragData;
		if (
			typeof parsed.nodePathKey === 'string' &&
			typeof parsed.effectIndex === 'number'
		) {
			return parsed;
		}
	} catch {
		return null;
	}

	return null;
};

const getDestinationIndex = ({
	fromIndex,
	insertionIndex,
}: {
	readonly fromIndex: number;
	readonly insertionIndex: number;
}) => {
	return insertionIndex > fromIndex ? insertionIndex - 1 : insertionIndex;
};

export const TimelineEffectItem: React.FC<{
	readonly label: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly effectIndex: number;
	readonly effects: readonly EffectDefinition<unknown>[];
	readonly effectSchema: InteractivitySchema;
	readonly documentationLink: string | null;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly rowDepth: number;
	readonly labelNextToToggle: boolean;
	readonly revealInInspector: boolean;
	readonly getIsExpanded: GetIsExpanded;
	readonly toggleTrack: (nodePathInfo: SequenceNodePathInfo) => void;
	readonly children: React.ReactNode;
	readonly beforeDropTargetRef: React.RefObject<HTMLDivElement | null> | null;
}> = ({
	label,
	nodePathInfo,
	effectIndex,
	effectSchema,
	effects,
	documentationLink,
	nodePath,
	validatedLocation,
	rowDepth,
	labelNextToToggle,
	revealInInspector,
	getIsExpanded,
	toggleTrack,
	children,
	beforeDropTargetRef,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {openInApps} = useOpenInMenuApps();
	const annotationTarget = useRef<HTMLDivElement>(null);
	const {remotionSkillsInfo} = useSettings();
	const markupSkill = remotionSkillsInfo?.skills.find(
		({name}) => name === 'remotion-markup',
	);
	const markupSkillAvailable = Boolean(
		markupSkill?.installedInProject || markupSkill?.installedGlobally,
	);
	const previewConnected = previewServerState.type === 'connected';
	Internals.useOptimisticEffects(nodePath);
	const deleteEffectsFromSource = useDeleteEffects();
	const canMutateEffects = canUseEffectOperations();
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const selection = useTimelineRowSelection(nodePathInfo, revealInInspector);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	const [dropIndicator, setDropIndicator] = useState<'before' | 'after' | null>(
		null,
	);
	const reorderTargetRef = useRef<HTMLDivElement>(null);
	const dropTargets = useContext(EffectReorderTargetsContext);
	if (dropTargets === null) {
		throw new Error('EffectReorderTargetsProvider is missing');
	}

	useLayoutEffect(() => {
		const element = reorderTargetRef.current;
		if (!element) return;
		const target: EffectDropTarget = {
			element,
			beforeElement: beforeDropTargetRef?.current ?? null,
			setIndicator: setDropIndicator,
		};
		dropTargets.set(effectIndex, target);
		return () => {
			if (activeEffectDropTarget?.target === target) {
				clearEffectDropIndicator();
			}

			if (dropTargets.get(effectIndex) === target) {
				dropTargets.delete(effectIndex);
			}
		};
	}, [beforeDropTargetRef, dropTargets, effectIndex]);

	const effectStatus = getProjectedEffectPropStatuses({
		propStatuses,
		nodePath,
		effectIndex,
	});

	const disabledStatus =
		effectStatus.type === 'can-update-effect'
			? (effectStatus.props?.disabled ?? null)
			: null;

	const isDisabled = useMemo(() => {
		if (disabledStatus?.status === 'static') {
			return Boolean(disabledStatus.codeValue);
		}

		return false;
	}, [disabledStatus]);

	const canShowToggle =
		previewConnected &&
		canUseEffectOperations() &&
		disabledStatus?.status === 'static';
	const canToggle = canShowToggle;

	const deleteDisabled =
		!previewConnected ||
		!canMutateEffects ||
		effectStatus.type !== 'can-update-effect' ||
		!validatedLocation.source;

	const canReorder =
		previewConnected &&
		canMutateEffects &&
		effectStatus.type === 'can-update-effect' &&
		Boolean(validatedLocation.source);

	const nodePathKey = useMemo(
		() => Internals.makeSequencePropsSubscriptionKey(nodePath),
		[nodePath],
	);

	const onDeleteEffectFromSource = useCallback(async () => {
		if (deleteDisabled) {
			return;
		}

		await deleteEffectsFromSource([
			{nodePath, effectIndices: [effectIndex], effects},
		]);
	}, [deleteDisabled, deleteEffectsFromSource, effectIndex, effects, nodePath]);

	const onDuplicateEffectFromSource = useCallback(() => {
		if (deleteDisabled) {
			return;
		}

		return duplicateEffectsFromSource([
			{type: 'sequence-effect', nodePathInfo, i: effectIndex},
		]);
	}, [deleteDisabled, effectIndex, nodePathInfo]);

	const openInEditor = useCallback(
		(editorId: EditorPickerId | null) => {
			const resolvedEditorId = editorId ?? openInApps.defaultEditorId;
			if (
				!openInApps.canOpenInEditor ||
				!resolvedEditorId ||
				!validatedLocation.source
			) {
				return;
			}

			openSourceInEditor({
				originalPosition: validatedLocation,
				editorId: resolvedEditorId,
				property: null,
				effectIndex,
			}).catch((error) => {
				showNotification((error as Error).message, 2000);
			});
		},
		[
			openInApps.canOpenInEditor,
			openInApps.defaultEditorId,
			validatedLocation,
			effectIndex,
		],
	);

	const openInCodingAgent = useCallback(
		(
			codingAgentId: DefaultCodingAgent,
			codingAgentName: string,
			contextForAgents: string | null,
		) => {
			openCodingAgent(codingAgentId, contextForAgents)
				.then((response) => {
					if (!response.success) {
						showNotification(`Could not open ${codingAgentName}`, 2000);
					}
				})
				.catch((error) => {
					showNotification((error as Error).message, 2000);
				});
		},
		[],
	);

	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		if (selection.selectable) {
			selection.onSelect({shiftKey: false, toggleKey: false});
		}

		const items: ComboboxValue[] = [
			...getSourceContextMenuItems({
				canOpenInEditor: openInApps.canOpenInEditor,
				codingAgentInfo: openInApps.codingAgentInfo,
				contextForAgents: formatContextForAgents({
					location: validatedLocation,
					name: `Effect "${label}"`,
					root: window.remotion_cwd,
				}),
				editorInfo: openInApps.editorInfo,
				onConfigureApps: openInApps.onConfigureApps,
				openInCodingAgent,
				openInEditor,
				originalLocation: validatedLocation,
				sourceTarget: {property: null, effectIndex},
			}),
			...(previewConnected && documentationLink
				? [
						{
							type: 'item' as const,
							id: 'open-effect-docs',
							keyHint: null,
							label: 'Open effect docs',
							leftItem: null,
							disabled: false,
							onClick: () => {
								window.open(documentationLink, '_blank', 'noopener,noreferrer');
							},
							quickSwitcherLabel: null,
							subMenu: null,
							value: 'open-effect-docs',
						},
					]
				: []),
			getCopyContextForAgentsMenuItem({
				contextForAgents: formatContextForAgents({
					location: validatedLocation,
					name: `Effect "${label}"`,
					root: window.remotion_cwd,
				}),
			}),
			...getAnnotateWithChatGPTMenuItems({
				id: 'annotate-effect',
				getTarget: () => annotationTarget.current,
				initialComment: markupSkillAvailable ? '$remotion-markup' : null,
				getMetadata: () => ({
					layer: nodePath.nodePath.join('.'),
					layerKeys: JSON.stringify(nodePath.sequenceKeys),
					effect: label,
					effectIndex,
					source:
						formatFileLocation({
							location: validatedLocation,
							root: window.remotion_cwd,
						}) ?? validatedLocation.source,
				}),
			}),
		];

		if (!previewConnected) {
			return items;
		}

		items.push({
			type: 'divider',
			id: 'copy-context-for-agents-divider',
		});

		items.push({
			type: 'item',
			id: 'duplicate-effect',
			keyHint: null,
			label: 'Duplicate',
			leftItem: null,
			disabled: deleteDisabled,
			onClick: onDuplicateEffectFromSource,
			quickSwitcherLabel: null,
			subMenu: null,
			value: 'duplicate-effect',
		});

		items.push({type: 'divider', id: 'effect-delete-divider'});

		items.push({
			type: 'item',
			id: 'delete-effect',
			keyHint: null,
			label: 'Delete',
			leftItem: null,
			disabled: deleteDisabled,
			onClick: () => {
				if (deleteDisabled) {
					return;
				}

				onDeleteEffectFromSource();
			},
			quickSwitcherLabel: null,
			subMenu: null,
			value: 'delete-effect',
		});

		return items;
	}, [
		deleteDisabled,
		documentationLink,
		label,
		effectIndex,
		markupSkillAvailable,
		nodePath,
		onDeleteEffectFromSource,
		onDuplicateEffectFromSource,
		openInApps,
		openInCodingAgent,
		openInEditor,
		previewConnected,
		selection,
		validatedLocation,
	]);

	const onToggle = useCallback(
		(type: 'enable' | 'disable') => {
			if (!canToggle || previewServerState.type !== 'connected') {
				return;
			}

			const newValue = type !== 'enable';
			const fieldSchema = effectSchema.disabled;
			const defaultValue =
				fieldSchema && fieldSchema.type === 'boolean'
					? JSON.stringify(fieldSchema.default)
					: null;

			saveEffectProp({
				type: 'value',
				fileName: validatedLocation.source,
				nodePath,
				effectIndex,
				fieldKey: 'disabled',
				value: newValue,
				defaultValue,
				schema: effectSchema,
				setPropStatuses,
				clientId: previewServerState.clientId,
			});
		},
		[
			canToggle,
			effectIndex,
			effectSchema,
			nodePath,
			previewServerState,
			setPropStatuses,
			validatedLocation.source,
		],
	);

	const isExpanded = getIsExpanded(nodePathInfo);

	const labelStyle = useMemo((): React.CSSProperties => {
		return {
			...rowLabel,
			...getTimelineSelectedLabelStyle(selection.selected, true),
			alignSelf: 'stretch',
			alignItems: 'center',
			color: getTimelineColor(selection.selected, true),
			display: 'inline-flex',
			flexShrink: 1,
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
			boxShadow:
				containsSelection && !selection.selected
					? `inset 0 0 0 2px ${TIMELINE_SELECTED_LABEL_BACKGROUND}`
					: undefined,
		};
	}, [containsSelection, selection.selected]);

	const getDropTarget = useCallback(
		(e: React.DragEvent<HTMLDivElement> | DragEvent, forceBefore: boolean) => {
			if (!e.dataTransfer || !(e.currentTarget instanceof HTMLElement)) {
				return null;
			}

			const dragData = getEffectReorderDragData(e.dataTransfer);
			if (!dragData || dragData.nodePathKey !== nodePathKey) {
				return null;
			}

			const rect = e.currentTarget.getBoundingClientRect();
			const before = forceBefore || e.clientY < rect.top + rect.height / 2;
			const insertionIndex = before ? effectIndex : effectIndex + 1;
			const toIndex = getDestinationIndex({
				fromIndex: dragData.effectIndex,
				insertionIndex,
			});

			if (toIndex === dragData.effectIndex) {
				return null;
			}

			return {
				dragData,
				toIndex,
				insertionIndex,
			};
		},
		[effectIndex, nodePathKey],
	);

	const onDragStart = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (!canReorder) {
				e.preventDefault();
				return;
			}

			const dragData = {nodePathKey, effectIndex};
			clearEffectDropIndicator();
			currentEffectDrag = dragData;
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData(
				EFFECT_REORDER_MIME_TYPE,
				JSON.stringify(dragData),
			);
			e.stopPropagation();
		},
		[canReorder, effectIndex, nodePathKey],
	);

	const onDragEnd = useCallback(() => {
		currentEffectDrag = null;
		clearEffectDropIndicator();
	}, []);

	const onDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement> | DragEvent, forceBefore: boolean) => {
			if (
				!canReorder ||
				!e.dataTransfer ||
				!hasEffectReorderDragType(e.dataTransfer)
			) {
				return;
			}

			const dropTarget = getDropTarget(e, forceBefore);
			if (!dropTarget) {
				clearEffectDropIndicator();
				return;
			}

			const afterLastEffect = dropTarget.insertionIndex === effects.length;
			const target = dropTargets.get(
				afterLastEffect ? effects.length - 1 : dropTarget.insertionIndex,
			);
			if (!target) {
				clearEffectDropIndicator();
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = 'move';
			if (activeEffectDropTarget?.target !== target) {
				clearEffectDropIndicator();
				activeEffectDropTarget = {target, scope: dropTargets};
			}

			target.setIndicator(afterLastEffect ? 'after' : 'before');
		},
		[canReorder, dropTargets, effects.length, getDropTarget],
	);

	const onDragLeave = useCallback(
		(event: React.DragEvent<HTMLDivElement> | DragEvent) =>
			handleEffectDragLeave(event, dropTargets),
		[dropTargets],
	);

	const onDrop = useCallback(
		async (
			e: React.DragEvent<HTMLDivElement> | DragEvent,
			forceBefore: boolean,
		) => {
			if (
				!canReorder ||
				previewServerState.type !== 'connected' ||
				!validatedLocation.source
			) {
				return;
			}

			const dropTarget = getDropTarget(e, forceBefore);
			if (!dropTarget) {
				clearEffectDropIndicator();
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			clearEffectDropIndicator();
			currentEffectDrag = null;

			try {
				const result = await reorderEffect({
					fileName: validatedLocation.source,
					sequenceNodePath: nodePath,
					fromIndex: dropTarget.dragData.effectIndex,
					toIndex: dropTarget.toIndex,
					clientId: previewServerState.clientId,
				});

				if (!result.success) {
					showNotification(result.reason, 4000);
				}
			} catch (err) {
				showNotification((err as Error).message, 4000);
			}
		},
		[
			canReorder,
			getDropTarget,
			nodePath,
			previewServerState,
			validatedLocation.source,
		],
	);

	useEffect(() => {
		const target = beforeDropTargetRef?.current;
		if (!target || !canReorder) {
			return;
		}

		const onBeforeDragOver = (event: DragEvent) => onDragOver(event, true);
		const onBeforeDrop = (event: DragEvent) => onDrop(event, true);

		target.addEventListener('dragover', onBeforeDragOver);
		target.addEventListener('dragleave', onDragLeave);
		target.addEventListener('drop', onBeforeDrop);
		return () => {
			target.removeEventListener('dragover', onBeforeDragOver);
			target.removeEventListener('dragleave', onDragLeave);
			target.removeEventListener('drop', onBeforeDrop);
		};
	}, [beforeDropTargetRef, canReorder, onDragLeave, onDragOver, onDrop]);

	const reorderLineStyle = useMemo((): React.CSSProperties | null => {
		if (!dropIndicator) {
			return null;
		}

		return {
			...reorderLineBase,
			...(dropIndicator === 'before' ? {top: 0} : {bottom: 0}),
		};
	}, [dropIndicator]);

	const row = (
		<TimelineRowChrome
			depth={rowDepth}
			eye={
				canShowToggle ? (
					<TimelineLayerEye
						type="effect"
						displayName={label}
						hidden={isDisabled}
						onInvoked={canToggle ? onToggle : null}
					/>
				) : (
					<TimelineLayerEyeSpacer />
				)
			}
			arrow={labelNextToToggle ? null : <TimelineExpandArrowSpacer />}
			style={rowStyle}
			selected={selection.selected}
			selectable={selection.selectable}
			onSelect={selection.onSelect}
			onDoubleClick={(event) => {
				event.stopPropagation();
				openInEditor(null);
			}}
			showSelectedBackground
			containsSelection={containsSelection}
			outerHeight={null}
			showBottomBorder={false}
		>
			<div style={labelContainerStyle}>
				<span role="group" aria-label={label} style={labelStyle}>
					{label}
				</span>
				<TimelineExpandArrowButton
					iconVariant={labelNextToToggle ? 'inspector' : 'timeline'}
					isExpanded={isExpanded}
					onClick={() => toggleTrack(nodePathInfo)}
					label={`${label} section`}
					disabled={false}
				/>
			</div>
		</TimelineRowChrome>
	);

	return (
		<div
			ref={reorderTargetRef}
			onDragOver={canReorder ? (event) => onDragOver(event, false) : undefined}
			onDrop={canReorder ? (event) => onDrop(event, false) : undefined}
			style={reorderWrapper}
		>
			{reorderLineStyle ? (
				<div data-remotion-effect-drop-indicator style={reorderLineStyle} />
			) : null}
			<ContextMenu ref={annotationTarget} getItems={getContextMenuItems}>
				<div
					draggable={canReorder}
					onDragStart={onDragStart}
					onDragEnd={onDragEnd}
				>
					{row}
				</div>
			</ContextMenu>
			{children}
		</div>
	);
};
