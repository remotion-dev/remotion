import React, {useContext, useMemo} from 'react';
import type {SequenceNodePath} from 'remotion';
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
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';
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
	readonly nodePath: SequenceNodePath;
	readonly nestedDepth: number;
}> = ({sequence, originalLocation, nodePath, nestedDepth}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {toggleTrack} = useContext(ExpandedTracksSetterContext);
	const {getDragOverrides, getCodeValues} = useContext(
		Internals.VisualModeGettersContext,
	);

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
		() =>
			buildTimelineTree({
				sequence,
				nodePath,
				getDragOverrides,
				getCodeValues,
			}),
		[sequence, nodePath, getDragOverrides, getCodeValues],
	);

	const flat = useMemo(
		() => flattenVisibleTreeNodes({nodes: tree, getIsExpanded}),
		[tree, getIsExpanded],
	);

	const expandedHeight = useMemo(
		() =>
			getExpandedTrackHeight({
				sequence,
				nodePath,
				getIsExpanded,
				getDragOverrides,
				getCodeValues,
			}),
		[sequence, nodePath, getIsExpanded, getDragOverrides, getCodeValues],
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
					<React.Fragment key={JSON.stringify(node.nodePath)}>
						{i > 0 ? <div style={separator} /> : null}
						<TimelineExpandedRow
							node={node}
							depth={depth}
							nestedDepth={nestedDepth}
							getIsExpanded={getIsExpanded}
							toggleTrack={toggleTrack}
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
