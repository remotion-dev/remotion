import React, {useCallback, useContext, useMemo} from 'react';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {ReactIcon} from '../../icons/react';
import {InlineEditableTitle} from '../InlineEditableTitle';
import {InspectorInfoHeader} from '../InspectorInfoHeader';
import {InspectorLocationCopy} from '../InspectorLocationCopy';
import {InspectorSourceLocation} from '../InspectorSourceLocation';
import {COMPACT_INLINE_ROW_HEIGHT} from '../layout';
import {useOpenSequenceInEditor} from '../Timeline/use-open-sequence-in-editor';
import {useRenameSequence} from '../Timeline/use-rename-sequence';
import {InspectorInlineAction, InspectorSectionDivider} from './common';
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
	height: COMPACT_INLINE_ROW_HEIGHT,
	lineHeight: '18px',
	margin: '0 4px',
	padding: '0 8px',
	width: 'calc(100% - 8px)',
};

const defaultCursor: React.CSSProperties = {
	cursor: 'default',
};

type SequenceInspectorSourceLocation = {
	readonly canOpenInEditor: boolean;
	readonly openFileLocation: () => void;
	readonly validatedLocation: CodePosition | null;
};

export const useSequenceInspectorSourceLocation = (
	sequence: TrackWithHash['sequence'],
): SequenceInspectorSourceLocation => {
	const {canOpenInEditor, openInEditor, originalLocation} =
		useOpenSequenceInEditor(sequence);

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

	return {
		canOpenInEditor,
		openFileLocation,
		validatedLocation,
	};
};

export const SequenceInspectorHeader: React.FC<{
	readonly sourceLocation: SequenceInspectorSourceLocation;
	readonly track: TrackWithHash;
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
			>
				<InlineEditableTitle
					value={sequenceDisplayName}
					canRename={canRename}
					onCommit={onRename}
					size="inspector"
				/>
				{documentationLink ? (
					<InspectorInlineAction
						disabled={false}
						style={defaultCursor}
						size="compact"
						title="Open component docs"
						onClick={openDocumentationLink}
					>
						{componentName}
					</InspectorInlineAction>
				) : (
					<div style={subtitleStyle}>{componentName}</div>
				)}
				<InspectorSourceLocation
					location={sourceLocation.validatedLocation}
					canOpen={sourceLocation.canOpenInEditor}
					onOpen={sourceLocation.openFileLocation}
					renderIcon={renderReactIcon}
					size="inline-action"
				/>
			</InspectorLocationCopy>
		</InspectorInfoHeader>
	);
};

export const SequenceInspectorSections: React.FC<{
	readonly track: TrackWithHash;
}> = ({track}) => {
	const sourceLocation = useSequenceInspectorSourceLocation(track.sequence);
	const connectedCompositions = useConnectedCompositions({track});

	return (
		<>
			<SequenceInspectorHeader sourceLocation={sourceLocation} track={track} />
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
