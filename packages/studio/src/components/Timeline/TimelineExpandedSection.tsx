import type {
	CanUpdateSequencePropStatus,
	EventSourceEvent,
} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import type {TSequence} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {
	getExpandedTrackHeight,
	getSchemaFields,
} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {
	TimelineFieldSavingSpinner,
	TimelineFieldValue,
} from './TimelineSchemaField';

const expandedSectionBase: React.CSSProperties = {
	color: 'white',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	display: 'flex',
	flexDirection: 'column',
	paddingLeft: 28,
	paddingRight: 10,
	borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
};

const fieldRow: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
};

const fieldName: React.CSSProperties = {
	fontSize: 12,
};

const fieldLabelRow: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: 6,
};

const TimelineFieldRow: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly onSave: (key: string, value: unknown) => Promise<void>;
	readonly onDragValueChange: (key: string, value: unknown) => void;
	readonly onDragEnd: () => void;
	readonly propStatus: CanUpdateSequencePropStatus | null;
}> = ({field, onSave, onDragValueChange, onDragEnd, propStatus}) => {
	const saving =
		propStatus !== null &&
		propStatus.canUpdate &&
		JSON.stringify(field.currentValue) !== JSON.stringify(propStatus.codeValue);

	return (
		<div style={{...fieldRow, height: field.rowHeight}}>
			<div style={fieldLabelRow}>
				<span style={fieldName}>{field.key}</span>
				<TimelineFieldSavingSpinner saving={saving} />
			</div>
			<TimelineFieldValue
				field={field}
				propStatus={propStatus}
				onSave={onSave}
				onDragValueChange={onDragValueChange}
				onDragEnd={onDragEnd}
				canUpdate={propStatus?.canUpdate ?? false}
			/>
		</div>
	);
};

export const TimelineExpandedSection: React.FC<{
	readonly sequence: TSequence;
	readonly originalLocation: OriginalPosition | null;
}> = ({sequence, originalLocation}) => {
	const [propStatuses, setPropStatuses] = useState<Record<
		string,
		CanUpdateSequencePropStatus
	> | null>(null);

	const {previewServerState: state, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
	const clientId = state.type === 'connected' ? state.clientId : undefined;

	const schemaFields = useMemo(
		() => getSchemaFields(sequence.controls),
		[sequence.controls],
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

	const locationSource = validatedLocation?.source ?? null;
	const locationLine = validatedLocation?.line ?? null;
	const locationColumn = validatedLocation?.column ?? null;
	const schemaKeysString = useMemo(
		() => (schemaFields ? schemaFields.map((f) => f.key).join(',') : null),
		[schemaFields],
	);

	const currentLocationSource = useRef(locationSource);
	currentLocationSource.current = locationSource;
	const currentLocationLine = useRef(locationLine);
	currentLocationLine.current = locationLine;
	const currentLocationColumn = useRef(locationColumn);
	currentLocationColumn.current = locationColumn;

	useEffect(() => {
		if (
			!clientId ||
			!locationSource ||
			!locationLine ||
			locationColumn === null ||
			!schemaKeysString
		) {
			setPropStatuses(null);
			return;
		}

		const keys = schemaKeysString.split(',');

		callApi('/api/subscribe-to-sequence-props', {
			fileName: locationSource,
			line: locationLine,
			column: locationColumn,
			keys,
			clientId,
		})
			.then((result) => {
				if (
					currentLocationSource.current !== locationSource ||
					currentLocationLine.current !== locationLine ||
					currentLocationColumn.current !== locationColumn
				) {
					return;
				}

				if (result.canUpdate) {
					setPropStatuses(result.props);
				} else {
					setPropStatuses(null);
				}
			})
			.catch(() => {
				setPropStatuses(null);
			});

		return () => {
			callApi('/api/unsubscribe-from-sequence-props', {
				fileName: locationSource,
				line: locationLine,
				column: locationColumn,
				clientId,
			}).catch(() => {
				// Ignore unsubscribe errors
			});
		};
	}, [
		clientId,
		locationSource,
		locationLine,
		locationColumn,
		schemaKeysString,
	]);

	useEffect(() => {
		if (!locationSource || !locationLine || locationColumn === null) {
			return;
		}

		const listener = (event: EventSourceEvent) => {
			if (event.type !== 'sequence-props-updated') {
				return;
			}

			if (
				event.fileName !== currentLocationSource.current ||
				event.line !== currentLocationLine.current ||
				event.column !== currentLocationColumn.current
			) {
				return;
			}

			if (event.result.canUpdate) {
				setPropStatuses(event.result.props);
			} else {
				setPropStatuses(null);
			}
		};

		const unsub = subscribeToEvent('sequence-props-updated', listener);
		return () => {
			unsub();
		};
	}, [locationSource, locationLine, locationColumn, subscribeToEvent]);

	const expandedHeight = useMemo(
		() => getExpandedTrackHeight(sequence.controls),
		[sequence.controls],
	);

	const {setOverride, clearOverrides} = useContext(
		Internals.SequenceControlOverrideContext,
	);

	const onSave = useCallback(
		(key: string, value: unknown): Promise<void> => {
			if (!propStatuses || !validatedLocation) {
				return Promise.reject(new Error('Cannot save'));
			}

			const status = propStatuses[key];
			if (!status || !status.canUpdate) {
				return Promise.reject(new Error('Cannot save'));
			}

			return callApi('/api/save-sequence-props', {
				fileName: validatedLocation.source,
				line: validatedLocation.line,
				column: validatedLocation.column,
				key,
				value: JSON.stringify(value),
				enumPaths: [],
			}).then(() => undefined);
		},
		[propStatuses, validatedLocation],
	);

	const overrideId = sequence.controls?.overrideId ?? sequence.id;

	const onDragValueChange = useCallback(
		(key: string, value: unknown) => {
			setOverride(overrideId, key, value);
		},
		[setOverride, overrideId],
	);

	const onDragEnd = useCallback(() => {
		clearOverrides(overrideId);
	}, [clearOverrides, overrideId]);

	return (
		<div style={{...expandedSectionBase, height: expandedHeight}}>
			{schemaFields
				? schemaFields.map((field) => (
						<TimelineFieldRow
							key={field.key}
							field={field}
							propStatus={propStatuses?.[field.key] ?? null}
							onSave={onSave}
							onDragValueChange={onDragValueChange}
							onDragEnd={onDragEnd}
						/>
					))
				: 'No schema'}
		</div>
	);
};
