import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {formatContextForAgents} from '../../helpers/format-file-location';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import type {SourceLocationTarget} from '../../helpers/open-in-editor';
import {BookIcon} from '../../icons/book';
import {ReactIcon} from '../../icons/react';
import {InlineEditableTitle} from '../InlineEditableTitle';
import {InspectorInfoHeader} from '../InspectorInfoHeader';
import {
	InspectorHeaderAction,
	InspectorHeaderActionSlot,
	InspectorLocationCopy,
	inspectorHeaderIconStyle,
} from '../InspectorLocationCopy';
import {InspectorOpenInEditor} from '../InspectorOpenInEditor';
import {useRenameSequence} from '../Timeline/use-rename-sequence';
import {useSequenceSourceLocation} from '../Timeline/use-sequence-source-location';
import {InspectorSection} from './common';
import {
	ConnectedCompositionsSection,
	useConnectedCompositions,
} from './ConnectedCompositionsSection';
import type {SequenceSectionSelection} from './inspector-selection';

const renderReactIcon = (color: string) => (
	<ReactIcon color={color} style={{...inspectorHeaderIconStyle, width: 20}} />
);

const renderDocsIcon = (color: string) => (
	<BookIcon color={color} style={{...inspectorHeaderIconStyle, width: 14}} />
);

type SequenceInspectorSourceLocation = {
	readonly validatedLocation: CodePosition | null;
};

export const useSequenceInspectorSourceLocation = (
	track: TimelineTrackData,
): SequenceInspectorSourceLocation => {
	const {location: originalLocation} = useSequenceSourceLocation(
		track.sequence,
		track.nodePathInfo?.sequenceSubscriptionKey ?? null,
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

	return {
		validatedLocation,
	};
};

export const SequenceInspectorHeader: React.FC<{
	readonly sourceLocation: SequenceInspectorSourceLocation;
	readonly track: TimelineTrackData;
	readonly selection: SequenceSectionSelection | null;
}> = ({sourceLocation, track, selection}) => {
	const [isEditing, setIsEditing] = useState(false);
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
	const componentName = track.sequence.controls?.componentName;
	const sourceTarget = useMemo<SourceLocationTarget | null>(() => {
		switch (selection?.type) {
			case 'sequence-prop':
				return {property: selection.key, effectIndex: null};
			case 'sequence-all-effects':
				return {property: 'effects', effectIndex: null};
			case 'sequence-effect':
				return {property: null, effectIndex: selection.i};
			case 'sequence-effect-prop':
				return {property: selection.key, effectIndex: selection.i};
			default:
				return null;
		}
	}, [selection]);
	const contextForAgents = useMemo(
		() =>
			formatContextForAgents({
				location: sourceLocation.validatedLocation,
				name: componentName ?? null,
				root: window.remotion_cwd,
			}),
		[componentName, sourceLocation.validatedLocation],
	);
	const openDocumentationLink = useCallback(() => {
		if (documentationLink) {
			window.open(documentationLink, '_blank', 'noopener,noreferrer');
		}
	}, [documentationLink]);
	const onRename = useCallback(
		(newName: string) => {
			saveName(newName).catch(() => undefined);
		},
		[saveName],
	);

	return (
		<InspectorInfoHeader contentSized padding="4px 0 0">
			<InspectorLocationCopy
				contextForAgents={contextForAgents}
				isEditing={isEditing}
				actions={
					<InspectorHeaderActionSlot>
						{sourceLocation.validatedLocation ? (
							<InspectorOpenInEditor
								sourceTarget={sourceTarget}
								menuTrigger={{label: 'Component', renderIcon: renderReactIcon}}
								annotationName={componentName ?? null}
								contextForAgents={contextForAgents}
								locationType={null}
								location={sourceLocation.validatedLocation}
								showTooltips
							/>
						) : null}
					</InspectorHeaderActionSlot>
				}
				leadingActions={
					<InspectorHeaderActionSlot>
						{documentationLink ? (
							<InspectorHeaderAction
								label={`Open docs for ${componentName ?? fallbackDisplayName}`}
								disabled={false}
								onClick={openDocumentationLink}
								renderIcon={renderDocsIcon}
							/>
						) : null}
					</InspectorHeaderActionSlot>
				}
			>
				<InlineEditableTitle
					value={sequenceDisplayName}
					canRename={canRename}
					onCommit={onRename}
					onEditingChange={setIsEditing}
					size="inspector"
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
			headerRef={null}
			expanded
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
	readonly selection: SequenceSectionSelection | null;
}> = ({track, selection}) => {
	const sourceLocation = useSequenceInspectorSourceLocation(track);
	const connectedCompositions = useConnectedCompositions({track});

	return (
		<>
			<SequenceInspectorHeader
				selection={selection}
				sourceLocation={sourceLocation}
				track={track}
			/>
			<SequenceInspectorDuplicationSection track={track} />
			{connectedCompositions.length > 0 ? (
				<ConnectedCompositionsSection
					connectedCompositions={connectedCompositions}
				/>
			) : null}
		</>
	);
};
