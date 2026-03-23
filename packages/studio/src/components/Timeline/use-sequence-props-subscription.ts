import type {EventSourceEvent, SequenceNodePath} from '@remotion/studio-shared';
import {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {Internals, type CanUpdateSequencePropStatus} from 'remotion';
import type {TSequence} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {getSchemaFields} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';

export const useSequencePropsSubscription = (
	sequence: TSequence,
	originalLocation: OriginalPosition | null,
): SequenceNodePath | null => {
	const {setCodeValues} = useContext(Internals.VisualModeOverridesContext);
	const overrideId = sequence.controls?.overrideId ?? null;

	const setPropStatusesForSequence = useCallback(
		(statuses: Record<string, CanUpdateSequencePropStatus> | null) => {
			if (!overrideId) {
				return;
			}

			setCodeValues(overrideId, statuses);
		},
		[overrideId, setCodeValues],
	);

	const {previewServerState: state, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
	const clientId = state.type === 'connected' ? state.clientId : undefined;

	const schemaFields = useMemo(
		() => getSchemaFields(sequence.controls),
		[sequence.controls],
	);

	const schemaKeysString = useMemo(
		() => (schemaFields ? schemaFields.map((f) => f.key).join(',') : null),
		[schemaFields],
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

	const currentLocationSource = useRef(locationSource);
	currentLocationSource.current = locationSource;
	const currentLocationLine = useRef(locationLine);
	currentLocationLine.current = locationLine;
	const currentLocationColumn = useRef(locationColumn);
	currentLocationColumn.current = locationColumn;

	const nodePathRef = useRef<SequenceNodePath | null>(null);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		if (
			!clientId ||
			!locationSource ||
			!locationLine ||
			locationColumn === null ||
			!schemaKeysString
		) {
			setPropStatusesForSequence(null);
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
					nodePathRef.current = result.nodePath;
					setPropStatusesForSequence(result.props);
				} else {
					nodePathRef.current = null;
					setPropStatusesForSequence(null);
				}
			})
			.catch((err) => {
				nodePathRef.current = null;
				Internals.Log.error(err);
				setPropStatusesForSequence(null);
			});

		return () => {
			const currentNodePath = nodePathRef.current;
			// Only clear props on true unmount, not on re-subscribe due to
			// line number changes — avoids flicker while re-subscribing.
			if (!isMountedRef.current) {
				setPropStatusesForSequence(null);
			}

			nodePathRef.current = null;
			if (currentNodePath) {
				callApi('/api/unsubscribe-from-sequence-props', {
					fileName: locationSource,
					nodePath: currentNodePath,
					clientId,
				}).catch(() => {
					// Ignore unsubscribe errors
				});
			}
		};
	}, [
		clientId,
		locationSource,
		locationLine,
		locationColumn,
		schemaKeysString,
		setPropStatusesForSequence,
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
				!nodePathRef.current ||
				JSON.stringify(event.nodePath) !== JSON.stringify(nodePathRef.current)
			) {
				return;
			}

			if (event.result.canUpdate) {
				setPropStatusesForSequence(event.result.props);
			} else {
				setPropStatusesForSequence(null);
			}
		};

		const unsub = subscribeToEvent('sequence-props-updated', listener);
		return () => {
			unsub();
		};
	}, [
		locationSource,
		locationLine,
		locationColumn,
		subscribeToEvent,
		setPropStatusesForSequence,
	]);

	return nodePathRef.current;
};
