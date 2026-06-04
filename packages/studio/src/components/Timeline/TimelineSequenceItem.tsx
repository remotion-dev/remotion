import {
	EFFECT_DRAG_MIME_TYPE,
	parseEffectDragData,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {formatFileLocation} from '../../helpers/format-file-location';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_LIST_ITEM_ROW_HEIGHT,
} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {duplicateSequencesFromSource} from './duplicate-selected-timeline-item';
import {saveSequenceProps} from './save-sequence-prop';
import {
	TimelineExpandArrowButton,
	TimelineExpandArrowSpacer,
} from './TimelineExpandArrowButton';
import {TimelineExpandedSection} from './TimelineExpandedSection';
import {TimelineItemStack} from './TimelineItemStack';
import {TimelineLayerEye, TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {
	getTimelineAssetLinkInfo,
	openTimelineAssetLink,
	TimelineMediaInfo,
} from './TimelineMediaInfo';
import {TimelineRowChrome} from './TimelineRowChrome';
import {
	isTimelineSelectionModifierEvent,
	SELECTION_ENABLED,
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
} from './TimelineSelection';
import {TimelineSequenceName} from './TimelineSequenceName';
import {useOpenSequenceInEditor} from './use-open-sequence-in-editor';

const labelContainerStyle: React.CSSProperties = {
	alignItems: 'center',
	alignSelf: 'stretch',
	display: 'flex',
	flexDirection: 'row',
	minWidth: 0,
	gap: 4,
};

const effectDropHighlight: React.CSSProperties = {
	backgroundColor: 'rgba(0, 155, 255, 0.16)',
	outline: '1px solid rgba(0, 155, 255, 0.75)',
	outlineOffset: -1,
};

const hasEffectDragType = (dataTransfer: DataTransfer) => {
	return Array.from(dataTransfer.types).some(
		(type) =>
			type === EFFECT_DRAG_MIME_TYPE ||
			type === 'application/json' ||
			type === 'text/plain',
	);
};

const getEffectDragData = (dataTransfer: DataTransfer) => {
	for (const type of [
		EFFECT_DRAG_MIME_TYPE,
		'application/json',
		'text/plain',
	]) {
		const value = dataTransfer.getData(type);
		if (!value) {
			continue;
		}

		const parsed = parseEffectDragData(value);
		if (parsed) {
			return parsed;
		}
	}

	return null;
};

export const TimelineSequenceItem: React.FC<{
	readonly sequence: TSequence;
	readonly nestedDepth: number;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly keyframeDisplayOffset: number;
}> = ({nestedDepth, sequence, nodePathInfo, keyframeDisplayOffset}) => {
	const nodePath = nodePathInfo?.sequenceSubscriptionKey ?? null;
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {toggleTrack} = useContext(ExpandedTracksSetterContext);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const {onSelect, selectable, selected} =
		useTimelineRowSelection(nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	const [effectDropHovered, setEffectDropHovered] = useState(false);

	const {canOpenInEditor, openInEditor, originalLocation} =
		useOpenSequenceInEditor(sequence);
	const fileLocation = useMemo(
		() =>
			formatFileLocation({
				location: originalLocation,
				root: window.remotion_cwd,
			}),
		[originalLocation],
	);

	const validatedLocation = useMemo(() => {
		if (
			!originalLocation ||
			!originalLocation.source ||
			!originalLocation.line
		) {
			return null;
		}

		return {
			source: originalLocation.source,
			line: originalLocation.line,
			column: originalLocation.column ?? 0,
		};
	}, [originalLocation]);

	const canDeleteFromSource = Boolean(nodePath && validatedLocation?.source);

	const deleteDisabled = useMemo(
		() => !previewConnected || !sequence.controls || !canDeleteFromSource,
		[previewConnected, sequence.controls, canDeleteFromSource],
	);

	const duplicateDisabled = deleteDisabled;

	const onDuplicateSequenceFromSource = useCallback(() => {
		if (!validatedLocation?.source || !nodePathInfo) {
			return;
		}

		duplicateSequencesFromSource([nodePathInfo]).catch(() => undefined);
	}, [nodePathInfo, validatedLocation?.source]);

	const onDeleteSequenceFromSource = useCallback(async () => {
		if (!validatedLocation?.source || !nodePath) {
			return;
		}

		if (nodePathInfo && nodePathInfo.numberOfSequencesWithThisNodePath > 1) {
			const message =
				'This sequence is programmatically duplicated ' +
				nodePathInfo.numberOfSequencesWithThisNodePath +
				' times in the code. Deleting removes all instances. Continue?';
			// eslint-disable-next-line no-alert -- native confirm before applying duplicate codemod in .map callbacks
			if (!window.confirm(message)) {
				return;
			}
		}

		try {
			const result = await callApi('/api/delete-jsx-node', {
				nodes: [
					{
						fileName: validatedLocation.source,
						nodePath: nodePath.nodePath,
					},
				],
			});
			if (result.success) {
				showNotification('Removed sequence from source file', 2000);
			} else {
				showNotification(result.reason, 4000);
			}
		} catch (err) {
			showNotification((err as Error).message, 4000);
		}
	}, [nodePath, validatedLocation?.source, nodePathInfo]);

	const mediaSrc =
		sequence.type === 'audio' ||
		sequence.type === 'video' ||
		sequence.type === 'image'
			? sequence.src
			: null;

	const assetLinkInfo = useMemo(
		() => (mediaSrc ? getTimelineAssetLinkInfo(mediaSrc) : null),
		[mediaSrc],
	);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		if (!previewConnected) {
			return [];
		}

		const editorName = window.remotion_editorName;
		const {documentationLink} = sequence;

		return [
			editorName
				? {
						type: 'item' as const,
						id: 'show-in-editor',
						keyHint: null,
						label: `Show in ${editorName}`,
						leftItem: null,
						disabled: !canOpenInEditor,
						onClick: () => {
							openInEditor();
						},
						quickSwitcherLabel: null,
						subMenu: null,
						value: 'show-in-editor',
					}
				: null,
			{
				type: 'item' as const,
				id: 'copy-file-location',
				keyHint: null,
				label: 'Copy file location',
				leftItem: null,
				disabled: !fileLocation,
				onClick: () => {
					if (!fileLocation) {
						return;
					}

					navigator.clipboard
						.writeText(fileLocation)
						.then(() => {
							showNotification('Copied file location to clipboard', 1000);
						})
						.catch((err) => {
							showNotification(
								`Could not copy to clipboard: ${(err as Error).message}`,
								1000,
							);
						});
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'copy-file-location',
			},
			documentationLink
				? {
						type: 'item' as const,
						id: 'open-component-docs',
						keyHint: null,
						label: 'Open component docs',
						leftItem: null,
						disabled: false,
						onClick: () => {
							window.open(documentationLink, '_blank', 'noopener,noreferrer');
						},
						quickSwitcherLabel: null,
						subMenu: null,
						value: 'open-component-docs',
					}
				: null,
			assetLinkInfo
				? {
						type: 'item' as const,
						id: 'show-asset',
						keyHint: null,
						label: 'Show asset',
						leftItem: null,
						disabled: false,
						onClick: () => {
							openTimelineAssetLink(assetLinkInfo, setCanvasContent);
						},
						quickSwitcherLabel: null,
						subMenu: null,
						value: 'show-asset',
					}
				: null,
			documentationLink
				? {
						type: 'divider' as const,
						id: 'open-component-docs-divider',
					}
				: null,
			{
				type: 'item' as const,
				id: 'duplicate-sequence',
				keyHint: null,
				label: 'Duplicate',
				leftItem: null,
				disabled: duplicateDisabled,
				onClick: () => {
					if (duplicateDisabled) {
						return;
					}

					onDuplicateSequenceFromSource();
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'duplicate-sequence',
			},
			{
				type: 'item' as const,
				id: 'delete-sequence',
				keyHint: null,
				label: 'Delete',
				leftItem: null,
				disabled: deleteDisabled,
				onClick: () => {
					if (deleteDisabled) {
						return;
					}

					onDeleteSequenceFromSource();
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'delete-sequence',
			},
		].filter(NoReactInternals.truthy);
	}, [
		assetLinkInfo,
		deleteDisabled,
		duplicateDisabled,
		fileLocation,
		onDeleteSequenceFromSource,
		onDuplicateSequenceFromSource,
		canOpenInEditor,
		openInEditor,
		previewConnected,
		sequence,
		setCanvasContent,
	]);

	const isExpanded =
		previewConnected && nodePathInfo !== null && getIsExpanded(nodePathInfo);

	const onToggleExpand = useCallback(() => {
		if (nodePathInfo === null) {
			return;
		}

		toggleTrack(nodePathInfo);
	}, [nodePathInfo, toggleTrack]);

	const onShowInEditorDoubleClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!SELECTION_ENABLED || !canOpenInEditor) {
				return;
			}

			if (isTimelineSelectionModifierEvent(e)) {
				e.stopPropagation();
				return;
			}

			e.stopPropagation();
			openInEditor();
		},
		[canOpenInEditor, openInEditor],
	);

	const codeValuesForOverride = useMemo(() => {
		return nodePath
			? Internals.getCodeValuesCtx(codeValues, nodePath)
			: undefined;
	}, [codeValues, nodePath]);

	const codeHiddenStatus = codeValuesForOverride?.hidden;

	const isItemHidden = useMemo(() => {
		const codeValue =
			codeHiddenStatus && codeHiddenStatus.status === 'static'
				? codeHiddenStatus.codeValue
				: undefined;
		const runtimeValue =
			sequence.controls?.currentRuntimeValueDotNotation.hidden;
		const effective = (codeValue ?? runtimeValue) as boolean | undefined;
		return effective ?? false;
	}, [codeHiddenStatus, sequence.controls?.currentRuntimeValueDotNotation]);

	const onToggleVisibility = useCallback(
		(type: 'enable' | 'disable') => {
			if (
				!sequence.controls ||
				!nodePath ||
				!validatedLocation ||
				!codeValuesForOverride ||
				!codeHiddenStatus ||
				codeHiddenStatus.status !== 'static' ||
				previewServerState.type !== 'connected'
			) {
				return;
			}

			const newValue = type !== 'enable';
			const {schema} = sequence.controls;

			const fieldSchema = schema.hidden;
			const defaultValue =
				fieldSchema && fieldSchema.type === 'boolean'
					? JSON.stringify(fieldSchema.default)
					: null;

			saveSequenceProps({
				changes: [
					{
						fileName: validatedLocation.source,
						nodePath,
						fieldKey: 'hidden',
						value: newValue,
						defaultValue,
						schema,
					},
				],
				setCodeValues,
				clientId: previewServerState.clientId,
				undoLabel: newValue ? 'Hide sequence' : 'Show sequence',
				redoLabel: newValue ? 'Hide sequence again' : 'Show sequence again',
			});
		},
		[
			codeHiddenStatus,
			codeValuesForOverride,
			nodePath,
			previewServerState,
			sequence.controls,
			setCodeValues,
			validatedLocation,
		],
	);

	const outerHeight = useMemo(
		() => getTimelineLayerHeight(sequence.type) + TIMELINE_ITEM_BORDER_BOTTOM,
		[sequence.type],
	);

	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: TIMELINE_LIST_ITEM_ROW_HEIGHT,
			color: 'white',
			fontFamily: 'Arial, Helvetica, sans-serif',
			wordBreak: 'break-all',
			textAlign: 'left',
			flexShrink: 0,
		};
	}, []);

	const rowStyle = useMemo((): React.CSSProperties => {
		return effectDropHovered
			? {
					...inner,
					...effectDropHighlight,
				}
			: inner;
	}, [effectDropHovered, inner]);

	const hasExpandableContent =
		Boolean(sequence.controls) || sequence.effects.length > 0;

	const canToggleVisibility =
		previewConnected &&
		Boolean(sequence.controls) &&
		nodePath !== null &&
		validatedLocation !== null &&
		codeHiddenStatus !== undefined &&
		codeHiddenStatus !== null &&
		codeHiddenStatus.status === 'static';

	const canDropEffect =
		previewServerState.type === 'connected' &&
		nodePath !== null &&
		validatedLocation !== null &&
		sequence.controls?.supportsEffects === true;

	const onEffectDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (!canDropEffect || !hasEffectDragType(e.dataTransfer)) {
				return;
			}

			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			setEffectDropHovered(true);
		},
		[canDropEffect],
	);

	const onEffectDragLeave = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
				return;
			}

			setEffectDropHovered(false);
		},
		[],
	);

	const onEffectDrop = useCallback(
		async (e: React.DragEvent<HTMLDivElement>) => {
			if (
				!canDropEffect ||
				previewServerState.type !== 'connected' ||
				nodePath === null ||
				validatedLocation === null
			) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			setEffectDropHovered(false);

			const dragData = getEffectDragData(e.dataTransfer);
			if (!dragData) {
				showNotification('Could not read effect drag data', 3000);
				return;
			}

			try {
				const result = await callApi('/api/add-effect', {
					fileName: validatedLocation.source,
					sequenceNodePath: nodePath,
					effectName: dragData.effect.name,
					effectImportPath: dragData.effect.importPath,
					effectConfig: dragData.effect.config,
					clientId: previewServerState.clientId,
				});

				if (result.success) {
					showNotification(`Added ${dragData.effect.name}()`, 2000);
				} else {
					showNotification(result.reason, 4000);
				}
			} catch (err) {
				showNotification((err as Error).message, 4000);
			}
		},
		[canDropEffect, nodePath, previewServerState, validatedLocation],
	);

	const trackRow = (
		<TimelineRowChrome
			depth={nestedDepth}
			eye={
				canToggleVisibility ? (
					<TimelineLayerEye
						type={sequence.type === 'audio' ? 'speaker' : 'eye'}
						hidden={isItemHidden}
						onInvoked={onToggleVisibility}
					/>
				) : (
					<TimelineLayerEyeSpacer />
				)
			}
			arrow={
				hasExpandableContent ? (
					<TimelineExpandArrowButton
						isExpanded={isExpanded}
						onClick={onToggleExpand}
						label="track properties"
						disabled={!previewConnected || nodePathInfo === null}
					/>
				) : (
					<TimelineExpandArrowSpacer />
				)
			}
			style={rowStyle}
			selected={selected}
			selectable={selectable}
			onSelect={onSelect}
			showSelectedBackground
			containsSelection={containsSelection}
			outerHeight={outerHeight}
			onDragLeave={canDropEffect ? onEffectDragLeave : undefined}
			onDragOver={canDropEffect ? onEffectDragOver : undefined}
			onDrop={canDropEffect ? onEffectDrop : undefined}
			onDoubleClick={
				SELECTION_ENABLED && canOpenInEditor
					? onShowInEditorDoubleClick
					: undefined
			}
		>
			<div style={labelContainerStyle}>
				<TimelineSequenceName
					sequence={sequence}
					selected={selected}
					containsSelection={containsSelection}
				/>
				{mediaSrc ? <TimelineMediaInfo src={mediaSrc} /> : null}
				<TimelineItemStack originalLocation={originalLocation} />
			</div>
		</TimelineRowChrome>
	);

	return (
		<>
			{previewConnected ? (
				<ContextMenu
					values={contextMenuValues}
					onOpen={selectable ? onSelect : null}
				>
					{trackRow}
				</ContextMenu>
			) : (
				trackRow
			)}
			{previewConnected &&
			isExpanded &&
			hasExpandableContent &&
			nodePathInfo &&
			validatedLocation ? (
				<TimelineExpandedSection
					sequence={sequence}
					validatedLocation={validatedLocation}
					nodePathInfo={nodePathInfo}
					nestedDepth={nestedDepth}
					keyframeDisplayOffset={keyframeDisplayOffset}
				/>
			) : null}
		</>
	);
};
