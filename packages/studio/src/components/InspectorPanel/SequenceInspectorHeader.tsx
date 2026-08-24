import React, {useCallback, useContext, useMemo} from 'react';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {CURRENT_COLOR} from '../../helpers/colors';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {ReactIcon} from '../../icons/react';
import {InlineEditableTitle} from '../InlineEditableTitle';
import {InspectorInfoHeader} from '../InspectorInfoHeader';
import {InspectorLocationCopy} from '../InspectorLocationCopy';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {InspectorSourceLocation} from '../InspectorSourceLocation';
import {COMPACT_CONTROL_ROW_HEIGHT} from '../layout';
import {useOpenSequenceInApps} from '../Timeline/use-open-sequence-in-apps';
import {useRenameSequence} from '../Timeline/use-rename-sequence';
import {
	InspectorQuickAction,
	InspectorSection,
	InspectorSectionDivider,
} from './common';
import {
	ConnectedCompositionsSection,
	useConnectedCompositions,
} from './ConnectedCompositionsSection';
import {sequenceHeaderSubtitle} from './styles';

const sourceLocationIconStyle: React.CSSProperties = {
	flexShrink: 0,
	height: 18,
	width: 18,
};

const renderReactIcon = (color: string) => {
	return <ReactIcon color={color} style={sourceLocationIconStyle} />;
};

const sequenceInspectorSubtitle: React.CSSProperties = {
	...sequenceHeaderSubtitle,
	alignItems: 'center',
	boxSizing: 'border-box',
	fontSize: 13,
	height: COMPACT_CONTROL_ROW_HEIGHT,
	lineHeight: '18px',
	margin: '0 4px',
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING - 4}px`,
	width: 'calc(100% - 8px)',
};

const defaultCursor: React.CSSProperties = {
	cursor: 'default',
};

const externalTabIndicatorStyle: React.CSSProperties = {
	display: 'inline-block',
	height: 12,
	marginLeft: 4,
	verticalAlign: -2,
	width: 12,
};

type SequenceInspectorSourceLocation = {
	readonly canOpenInEditor: boolean;
	readonly openFileLocation: () => void;
	readonly validatedLocation: CodePosition | null;
};

export const useSequenceInspectorSourceLocation = (
	sequence: TimelineTrackData['sequence'],
): SequenceInspectorSourceLocation => {
	const {canOpenInEditor, openInEditor, originalLocation} =
		useOpenSequenceInApps(sequence);

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

		openInEditor(null);
	}, [canOpenInEditor, openInEditor]);

	return {
		canOpenInEditor,
		openFileLocation,
		validatedLocation,
	};
};

export const SequenceInspectorHeader: React.FC<{
	readonly sourceLocation: SequenceInspectorSourceLocation;
	readonly track: TimelineTrackData;
}> = ({sourceLocation, track}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canRename, displayName, fallbackDisplayName, saveName} =
		useRenameSequence({
			clientId:
				previewServerState.type === 'connected'
					? previewServerState.clientId
					: null,
			nodePathInfo: track.nodePathInfo,
			sequence: track.sequence,
			validatedLocation: sourceLocation.validatedLocation,
		});
	const sequenceDisplayName = displayName || fallbackDisplayName;
	const {documentationLink} = track.sequence;

	const openDocumentationLink = useCallback(() => {
		if (!documentationLink) {
			return;
		}

		window.open(documentationLink, '_blank', 'noopener,noreferrer');
	}, [documentationLink]);

	const subtitleStyle = useMemo((): React.CSSProperties => {
		return {
			...sequenceInspectorSubtitle,
			cursor: documentationLink ? 'pointer' : 'default',
		};
	}, [documentationLink]);

	const componentName = track.sequence.controls?.componentName;
	const onRename = useCallback(
		(newName: string) => {
			saveName(newName).catch(() => undefined);
		},
		[saveName],
	);

	return (
		<InspectorInfoHeader contentSized padding="4px 0">
			<InspectorLocationCopy
				location={sourceLocation.validatedLocation}
				name={componentName ?? null}
				openInEditorLocation={sourceLocation.validatedLocation}
			>
				<InlineEditableTitle
					value={sequenceDisplayName}
					canRename={canRename}
					onCommit={onRename}
					size="inspector"
				/>
				{documentationLink ? (
					<InspectorQuickAction
						disabled={false}
						style={defaultCursor}
						title="Open component docs"
						onClick={openDocumentationLink}
					>
						{componentName}
						<svg
							aria-hidden="true"
							viewBox="0 0 16 16"
							style={externalTabIndicatorStyle}
						>
							<path
								d="M4 12 12 4M6 4h6v6"
								fill="none"
								stroke={CURRENT_COLOR}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="1.5"
							/>
						</svg>
					</InspectorQuickAction>
				) : (
					<div style={subtitleStyle}>{componentName}</div>
				)}
				<InspectorSourceLocation
					location={sourceLocation.validatedLocation}
					canOpen={sourceLocation.canOpenInEditor}
					onOpen={sourceLocation.openFileLocation}
					renderIcon={renderReactIcon}
					size="quick-action"
				/>
			</InspectorLocationCopy>
		</InspectorInfoHeader>
	);
};

export const SequenceInspectorDuplicationSection: React.FC<{
	readonly track: TimelineTrackData;
}> = ({track}) => {
	const numberOfInstances =
		track.nodePathInfo?.numberOfSequencesWithThisNodePath ?? 0;
	if (numberOfInstances <= 1) {
		return null;
	}

	return (
		<InspectorSection
			header={
				<span
					style={{
						color: 'inherit',
						display: 'block',
						fontFamily: 'inherit',
						fontSize: 'inherit',
						fontWeight: 'normal',
						lineHeight: 'inherit',
						margin: '2px 0',
					}}
				>
					{numberOfInstances} instances
				</span>
			}
		>
			{null}
		</InspectorSection>
	);
};

export const SequenceInspectorSections: React.FC<{
	readonly track: TimelineTrackData;
}> = ({track}) => {
	const sourceLocation = useSequenceInspectorSourceLocation(track.sequence);
	const connectedCompositions = useConnectedCompositions({track});

	return (
		<>
			<SequenceInspectorHeader sourceLocation={sourceLocation} track={track} />
			<SequenceInspectorDuplicationSection track={track} />
			{connectedCompositions.length > 0 ? (
				<>
					<InspectorSectionDivider />
					<ConnectedCompositionsSection
						connectedCompositions={connectedCompositions}
					/>
				</>
			) : null}
		</>
	);
};
