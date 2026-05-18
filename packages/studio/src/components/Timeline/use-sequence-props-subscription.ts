import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import {useContext, useEffect, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {ExpandedTracksSetterContext} from '../ExpandedTracksProvider';
import {acquireSequencePropsSubscription} from './sequence-props-subscription-store';

export const useSequencePropsSubscription = ({
	originalLocation,
	overrideId,
	schema,
	effects,
}: {
	overrideId: string;
	schema: SequenceSchema;
	effects: SequenceSchema[];
	originalLocation: OriginalPosition | null;
}) => {
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {setOverrideIdToNodePath} = useContext(
		Internals.OverrideIdsToNodePathsSettersContext,
	);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {migrateExpandedTracksForSubscriptionKey} = useContext(
		ExpandedTracksSetterContext,
	);

	const {previewServerState: state} = useContext(StudioServerConnectionCtx);
	const previousNodePathRef = useRef<SequencePropsSubscriptionKey | null>(null);
	const nodePathAtResubscribeRef = useRef<SequencePropsSubscriptionKey | null>(
		null,
	);
	const previousLocationKeyRef = useRef<string | null>(null);
	const clientId = state.type === 'connected' ? state.clientId : undefined;

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

	const locationKey =
		locationSource !== null && locationLine !== null && locationColumn !== null
			? `${locationSource}\0${locationLine}\0${locationColumn}`
			: null;

	if (locationKey !== previousLocationKeyRef.current) {
		previousLocationKeyRef.current = locationKey;
		nodePathAtResubscribeRef.current =
			overrideIdToNodePathMappings[overrideId] ?? null;
	}

	useEffect(() => {
		if (
			!clientId ||
			!locationSource ||
			!locationLine ||
			locationColumn === null ||
			!schema
		) {
			return;
		}

		const {release} = acquireSequencePropsSubscription({
			fileName: locationSource,
			line: locationLine,
			column: locationColumn,
			schema,
			effects,
			clientId,
			applyOnce: (result) => {
				if (!result.success) {
					return;
				}

				setCodeValues(result.nodePath, () => result.status);
			},
			applyEach: (result) => {
				if (!result.success) {
					return;
				}

				const newNodePath = result.nodePath;
				const previousNodePath =
					previousNodePathRef.current ?? nodePathAtResubscribeRef.current;

				if (
					previousNodePath &&
					stringifySequenceSubscriptionKey(previousNodePath) !==
						stringifySequenceSubscriptionKey(newNodePath)
				) {
					migrateExpandedTracksForSubscriptionKey(
						previousNodePath,
						newNodePath,
					);
				}

				previousNodePathRef.current = newNodePath;
				setOverrideIdToNodePath(overrideId, newNodePath);
			},
		});

		return () => {
			release();
		};
	}, [
		clientId,
		effects,
		locationColumn,
		locationLine,
		locationSource,
		migrateExpandedTracksForSubscriptionKey,
		overrideId,
		schema,
		setCodeValues,
		setOverrideIdToNodePath,
	]);
};
