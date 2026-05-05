import type {SequenceNodePath} from '@remotion/studio-shared';
import React, {useContext, useMemo} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {
	CodePosition,
	OriginalPosition,
} from '../../error-overlay/react-overlay/utils/get-source-map';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {
	buildTimelineTree,
	flattenVisibleTreeNodes,
	getExpandedTrackHeight,
} from '../../helpers/timeline-layout';
import {ExpandedTracksContext} from '../ExpandedTracksProvider';
import {TimelineExpandedRow} from './TimelineExpandedRow';

const expandedSectionBase: React.CSSProperties = {
	color: 'white',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	display: 'flex',
	flexDirection: 'column',
	borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
};

const separator: React.CSSProperties = {
	height: 1,
	backgroundColor: TIMELINE_TRACK_SEPARATOR,
};

export const TimelineExpandedSection: React.FC<{
	readonly sequence: TSequence;
	readonly originalLocation: OriginalPosition | null;
	readonly nodePath: SequenceNodePath | null;
	readonly nestedDepth: number;
}> = ({sequence, originalLocation, nodePath, nestedDepth}) => {
	const {expandedTracks, toggleTrack} = useContext(ExpandedTracksContext);
	const {dragOverrides, codeValues} = useContext(
		Internals.VisualModeOverridesContext,
	);

	const {overrideId} = sequence.controls!;

	const validatedLocation: CodePosition | null = useMemo(() => {
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

	const tree = useMemo(
		() => buildTimelineTree({sequence, dragOverrides, codeValues}),
		[sequence, dragOverrides, codeValues],
	);

	const flat = useMemo(
		() => flattenVisibleTreeNodes({nodes: tree, expandedTracks}),
		[tree, expandedTracks],
	);

	const expandedHeight = useMemo(
		() =>
			getExpandedTrackHeight(
				sequence,
				expandedTracks,
				dragOverrides,
				codeValues,
			),
		[sequence, expandedTracks, dragOverrides, codeValues],
	);

	const style = useMemo(() => {
		return {
			...expandedSectionBase,
			height: expandedHeight,
		};
	}, [expandedHeight]);

	const {schema} = sequence.controls!;

	if (flat.length === 0) {
		return <div style={style}>No schema</div>;
	}

	return (
		<div style={style}>
			{flat.map(({node, depth}, i) => {
				return (
					<React.Fragment key={node.id}>
						{i > 0 ? <div style={separator} /> : null}
						<TimelineExpandedRow
							node={node}
							depth={depth}
							nestedDepth={nestedDepth}
							expandedTracks={expandedTracks}
							toggleTrack={toggleTrack}
							overrideId={overrideId}
							validatedLocation={validatedLocation}
							nodePath={nodePath}
							schema={schema}
						/>
					</React.Fragment>
				);
			})}
		</div>
	);
};
