import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {PencilIcon} from '../../icons/pencil';
import {
	hasSequenceControls,
	InspectorSequenceSection,
} from '../InspectorSequenceSection';
import {InspectorSourceLocation} from '../InspectorSourceLocation';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {saveSequenceProps} from '../Timeline/save-sequence-prop';
import {
	canRenameSequence,
	getSequenceDisplayName,
} from '../Timeline/sequence-name-editing';
import {
	getTimelineSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from '../Timeline/TimelineSelection';
import {useOpenSequenceInEditor} from '../Timeline/use-open-sequence-in-editor';
import {InspectorMessage, InspectorSectionHeader} from './common';
import type {SequenceSectionSelection} from './inspector-selection';
import {selectedContainer, sequenceHeader, sequenceHeaderTitle} from './styles';
import {useTrackForSelection} from './use-track-for-selection';

const RENAME_INPUT_CLASS_NAME = 'remotion-inspector-sequence-name-input';

const titleRow: React.CSSProperties = {
	alignItems: 'center',
	alignSelf: 'flex-start',
	display: 'flex',
	maxWidth: '100%',
	minWidth: 0,
};

const editButton: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'transparent',
	border: 0,
	color: 'white',
	cursor: 'pointer',
	display: 'inline-flex',
	flexShrink: 0,
	height: 18,
	justifyContent: 'center',
	marginLeft: 4,
	padding: 0,
	width: 18,
};

const iconStyle: React.CSSProperties = {
	height: 11,
	width: 11,
};

const titleInputStyle: React.CSSProperties = {
	...sequenceHeaderTitle,
	backgroundColor: 'rgba(255, 255, 255, 0.08)',
	border: '1px solid rgba(255, 255, 255, 0.28)',
	borderRadius: 3,
	boxSizing: 'border-box',
	height: 20,
	outline: 'none',
	padding: '0 4px',
	userSelect: 'text',
	WebkitUserSelect: 'text',
};

const useSequenceNameInfo = (track: TrackWithHash) => {
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const nodePath = track.nodePathInfo?.sequenceSubscriptionKey ?? null;

	return useMemo(() => {
		const propStatusesForOverride = nodePath
			? Internals.getPropStatusesCtx(propStatuses, nodePath)
			: undefined;
		const codeNameStatus = propStatusesForOverride?.name;
		const displayName = getSequenceDisplayName({
			codeNameStatus,
			fallbackName: track.sequence.displayName,
		});

		return {codeNameStatus, displayName};
	}, [nodePath, propStatuses, track.sequence.displayName]);
};

const InspectorSequenceTitle: React.FC<{
	readonly canRename: boolean;
	readonly displayName: string;
	readonly documentationLink: string | null;
	readonly onOpenDocumentationLink: () => void;
	readonly onSaveName: (name: string) => Promise<void>;
}> = ({
	canRename,
	displayName,
	documentationLink,
	onOpenDocumentationLink,
	onSaveName,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const cancelNextBlurRef = useRef(false);
	const [draftName, setDraftName] = useState(displayName);
	const [editing, setEditing] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [focusWithin, setFocusWithin] = useState(false);
	const titleText = displayName || '<Sequence>';
	const showEditButton = canRename && (hovered || focusWithin);

	useEffect(() => {
		if (!canRename) {
			setEditing(false);
		}
	}, [canRename]);

	useEffect(() => {
		if (!editing) {
			setDraftName(displayName);
			return;
		}

		const input = inputRef.current;
		if (!input) {
			return;
		}

		input.focus();
		const basenameIndex = displayName.lastIndexOf('.');
		const selectionEnd = basenameIndex > 0 ? basenameIndex : displayName.length;
		input.setSelectionRange(0, selectionEnd);
	}, [displayName, editing]);

	const startEditing = useCallback(() => {
		if (!canRename) {
			return;
		}

		setDraftName(displayName);
		setEditing(true);
	}, [canRename, displayName]);

	const save = useCallback(() => {
		setEditing(false);
		onSaveName(draftName).catch(() => undefined);
	}, [draftName, onSaveName]);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Escape') {
				cancelNextBlurRef.current = true;
				e.preventDefault();
				setEditing(false);
				return;
			}

			if (e.key === 'Enter') {
				cancelNextBlurRef.current = true;
				e.preventDefault();
				save();
			}
		},
		[save],
	);

	const onBlurInput = useCallback(() => {
		if (cancelNextBlurRef.current) {
			cancelNextBlurRef.current = false;
			return;
		}

		save();
	}, [save]);

	const onBlurRow = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
		if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
			return;
		}

		setFocusWithin(false);
	}, []);

	const titleStyle = useMemo((): React.CSSProperties => {
		return {
			...sequenceHeaderTitle,
			cursor: documentationLink ? 'pointer' : canRename ? 'text' : 'default',
		};
	}, [canRename, documentationLink]);

	if (editing) {
		return (
			<div style={titleRow}>
				<style>
					{`.${RENAME_INPUT_CLASS_NAME}::selection { background: rgba(255, 255, 255, 0.72); color: black; }`}
				</style>
				<input
					ref={inputRef}
					className={RENAME_INPUT_CLASS_NAME}
					value={draftName}
					onChange={(e) => setDraftName(e.target.value)}
					onBlur={onBlurInput}
					onKeyDown={onKeyDown}
					size={Math.max(1, draftName.length)}
					style={titleInputStyle}
				/>
			</div>
		);
	}

	return (
		<div
			style={titleRow}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
			onFocus={() => setFocusWithin(true)}
			onBlur={onBlurRow}
		>
			{documentationLink ? (
				<button
					type="button"
					style={titleStyle}
					title="Open component docs"
					onClick={onOpenDocumentationLink}
				>
					{titleText}
				</button>
			) : (
				<div
					style={titleStyle}
					title={titleText}
					onDoubleClick={canRename ? startEditing : undefined}
				>
					{titleText}
				</div>
			)}
			{canRename ? (
				<button
					type="button"
					aria-label="Rename sequence"
					title="Rename sequence"
					onClick={startEditing}
					style={{
						...editButton,
						opacity: showEditButton ? 1 : 0,
					}}
					tabIndex={showEditButton ? 0 : -1}
				>
					<PencilIcon style={iconStyle} />
				</button>
			) : null}
		</div>
	);
};

const SequenceExpandedInspector: React.FC<{
	readonly track: TrackWithHash;
}> = ({track}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectedItems, selectItems} = useTimelineSelection();
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {canOpenInEditor, openInEditor, originalLocation} =
		useOpenSequenceInEditor(track.sequence);
	const {codeNameStatus, displayName} = useSequenceNameInfo(track);
	const {documentationLink} = track.sequence;
	const nodePath = track.nodePathInfo?.sequenceSubscriptionKey ?? null;

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
	const openFileLocation = useCallback(() => {
		if (!canOpenInEditor) {
			return;
		}

		openInEditor();
	}, [canOpenInEditor, openInEditor]);
	const openDocumentationLink = useCallback(() => {
		if (!documentationLink) {
			return;
		}

		window.open(documentationLink, '_blank', 'noopener,noreferrer');
	}, [documentationLink]);
	const sequenceSelection = useMemo((): TimelineSelection | null => {
		if (!track.nodePathInfo) {
			return null;
		}

		return {
			type: 'sequence',
			nodePathInfo: track.nodePathInfo,
		};
	}, [track.nodePathInfo]);
	const sequenceSelected = useMemo(() => {
		if (sequenceSelection === null || selectedItems.length !== 1) {
			return false;
		}

		return (
			getTimelineSelectionKey(selectedItems[0]) ===
			getTimelineSelectionKey(sequenceSelection)
		);
	}, [selectedItems, sequenceSelection]);
	const selectSequenceOnInspectorPointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (event.button !== 0 || sequenceSelection === null) {
				return;
			}

			event.stopPropagation();
			if (sequenceSelected) {
				return;
			}

			selectItems([sequenceSelection]);
		},
		[selectItems, sequenceSelected, sequenceSelection],
	);
	const canRenameThisSequence = canRenameSequence({
		codeNameStatus,
		nodePath,
		previewConnected: previewServerState.type === 'connected',
		readOnlyStudio: window.remotion_isReadOnlyStudio,
		sequence: track.sequence,
		validatedLocation,
	});
	const onSaveName = useCallback(
		async (name: string) => {
			if (
				!canRenameThisSequence ||
				previewServerState.type !== 'connected' ||
				!track.sequence.controls ||
				!nodePath ||
				!validatedLocation
			) {
				return;
			}

			if (name === displayName) {
				return;
			}

			await saveSequenceProps({
				changes: [
					{
						fileName: validatedLocation.source,
						nodePath,
						fieldKey: 'name',
						value: name,
						defaultValue: null,
						schema: track.sequence.controls.schema,
					},
				],
				setPropStatuses,
				clientId: previewServerState.clientId,
				undoLabel: 'Rename sequence',
				redoLabel: 'Rename sequence again',
			});
		},
		[
			canRenameThisSequence,
			displayName,
			nodePath,
			previewServerState,
			setPropStatuses,
			track.sequence.controls,
			validatedLocation,
		],
	);

	if (previewServerState.type !== 'connected') {
		return <InspectorMessage>Studio server disconnected</InspectorMessage>;
	}

	if (
		!track.nodePathInfo ||
		!hasSequenceControls(track.sequence) ||
		!validatedLocation
	) {
		return <InspectorMessage>Sequence inspector unavailable</InspectorMessage>;
	}

	return (
		<div
			style={selectedContainer}
			className={VERTICAL_SCROLLBAR_CLASSNAME}
			onPointerDown={selectSequenceOnInspectorPointerDown}
		>
			<div style={sequenceHeader}>
				<InspectorSequenceTitle
					canRename={canRenameThisSequence}
					displayName={displayName}
					documentationLink={documentationLink}
					onOpenDocumentationLink={openDocumentationLink}
					onSaveName={onSaveName}
				/>
				<InspectorSourceLocation
					location={validatedLocation}
					canOpen={canOpenInEditor}
					onOpen={openFileLocation}
				/>
			</div>
			<InspectorSequenceSection
				sequence={track.sequence}
				validatedLocation={validatedLocation}
				nodePathInfo={track.nodePathInfo}
				keyframeDisplayOffset={track.keyframeDisplayOffset}
				renderSectionHeader={(children) => (
					<InspectorSectionHeader>{children}</InspectorSectionHeader>
				)}
			/>
		</div>
	);
};

export const SequenceSelectionInspector: React.FC<{
	readonly selection: SequenceSectionSelection;
}> = ({selection}) => {
	const track = useTrackForSelection(selection);

	if (!track) {
		return <InspectorMessage>Sequence inspector unavailable</InspectorMessage>;
	}

	return <SequenceExpandedInspector track={track} />;
};
