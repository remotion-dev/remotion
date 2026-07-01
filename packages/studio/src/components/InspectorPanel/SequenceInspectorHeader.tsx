import React, {useCallback, useContext, useMemo} from 'react';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {InlineEditableTitle} from '../InlineEditableTitle';
import {InspectorSourceLocation} from '../InspectorSourceLocation';
import {useOpenSequenceInEditor} from '../Timeline/use-open-sequence-in-editor';
import {useRenameSequence} from '../Timeline/use-rename-sequence';
import {
	sequenceHeader,
	sequenceHeaderDivider,
	sequenceHeaderSubtitle,
	sequenceHeaderTitle,
} from './styles';

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
			...sequenceHeaderSubtitle,
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
		<div style={sequenceHeader}>
			<div style={sequenceHeaderTitle}>
				<InlineEditableTitle
					value={sequenceDisplayName}
					canRename={canRename}
					onCommit={onRename}
				/>
			</div>
			{documentationLink ? (
				<button
					type="button"
					style={subtitleStyle}
					title="Open component docs"
					onClick={openDocumentationLink}
				>
					{componentName}
				</button>
			) : (
				<div style={subtitleStyle}>{componentName}</div>
			)}
			<InspectorSourceLocation
				location={sourceLocation.validatedLocation}
				canOpen={sourceLocation.canOpenInEditor}
				onOpen={sourceLocation.openFileLocation}
			/>
		</div>
	);
};

export const SequenceInspectorHeaderWithDivider: React.FC<{
	readonly track: TrackWithHash;
}> = ({track}) => {
	const sourceLocation = useSequenceInspectorSourceLocation(track.sequence);

	return (
		<>
			<SequenceInspectorHeader sourceLocation={sourceLocation} track={track} />
			<div style={sequenceHeaderDivider} />
		</>
	);
};
