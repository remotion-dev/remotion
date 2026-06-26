import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {InspectorSourceLocation} from '../InspectorSourceLocation';
import {useOpenSequenceInEditor} from '../Timeline/use-open-sequence-in-editor';
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

const useSequenceDisplayName = (track: TrackWithHash) => {
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const nodePath = track.nodePathInfo?.sequenceSubscriptionKey ?? null;

	return useMemo(() => {
		const propStatusesForOverride = nodePath
			? Internals.getPropStatusesCtx(propStatuses, nodePath)
			: undefined;
		const codeNameStatus = propStatusesForOverride?.name;
		const fallbackDisplayName =
			track.sequence.controls?.componentName || '<Sequence>';

		if (
			codeNameStatus?.status === 'static' &&
			typeof codeNameStatus.codeValue === 'string'
		) {
			return codeNameStatus.codeValue;
		}

		if (codeNameStatus?.status === 'static') {
			return fallbackDisplayName;
		}

		return track.sequence.displayName || fallbackDisplayName;
	}, [
		nodePath,
		propStatuses,
		track.sequence.controls?.componentName,
		track.sequence.displayName,
	]);
};

export const SequenceInspectorHeader: React.FC<{
	readonly sourceLocation: SequenceInspectorSourceLocation;
	readonly track: TrackWithHash;
}> = ({sourceLocation, track}) => {
	const sequenceDisplayName = useSequenceDisplayName(track);
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

	return (
		<div style={sequenceHeader}>
			<div style={sequenceHeaderTitle}>{sequenceDisplayName}</div>
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
