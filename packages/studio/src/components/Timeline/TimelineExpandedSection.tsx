import type {SequenceNodePath} from '@remotion/studio-shared';
import React, {useMemo} from 'react';
import type {TSequence} from 'remotion';
import type {
	CodePosition,
	OriginalPosition,
} from '../../error-overlay/react-overlay/utils/get-source-map';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {
	getExpandedTrackHeight,
	getSchemaFields,
} from '../../helpers/timeline-layout';
import {TimelineFieldRow} from './TimelineFieldRow';

export const EXPANDED_SECTION_PADDING_LEFT = 28;
export const EXPANDED_SECTION_PADDING_RIGHT = 10;

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
	readonly nestedDepth: number;
	readonly nodePath: SequenceNodePath | null;
}> = ({sequence, originalLocation, nestedDepth, nodePath}) => {
	const overrideId = sequence.controls?.overrideId ?? sequence.id;
	const schemaFields = useMemo(
		() => getSchemaFields(sequence.controls),
		[sequence.controls],
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

	const expandedHeight = useMemo(
		() => getExpandedTrackHeight(sequence.controls),
		[sequence.controls],
	);

	const style = useMemo(() => {
		return {
			...expandedSectionBase,
			height: expandedHeight,
		};
	}, [expandedHeight]);

	const keysToObserve = useMemo(() => {
		if (!schemaFields) {
			return [];
		}

		return schemaFields.map((f) => f.key);
	}, [schemaFields]);

	return (
		<div style={style}>
			{schemaFields
				? schemaFields.map((field, i) => {
						return (
							<React.Fragment key={field.key}>
								{i > 0 ? <div style={separator} /> : null}
								<TimelineFieldRow
									field={field}
									overrideId={overrideId}
									validatedLocation={validatedLocation}
									nestedDepth={nestedDepth}
									nodePath={nodePath}
									keysToObserve={keysToObserve}
								/>
							</React.Fragment>
						);
					})
				: 'No schema'}
		</div>
	);
};
