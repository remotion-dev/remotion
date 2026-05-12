import {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {Internals, type CanUpdateSequencePropStatus} from 'remotion';
import type {SequenceSchema, NodePathsState, SequenceNodePath} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	acquireSequencePropsSubscription,
	type SequencePropsSnapshot,
} from './sequence-props-subscription-store';

export const useSequencePropsSubscription = (
	overrideId: string,
	schema: SequenceSchema,
	originalLocation: OriginalPosition | null,
	visualModeEnabled: boolean,
) => {
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {setOverrideIdToNodePath} = useContext(
		Internals.OverrideIdsToNodePathsSettersContext,
	);

	const setPropStatusesForSequence = useCallback(
		(
			nodePath: SequenceNodePath,
			statuses: Record<string, CanUpdateSequencePropStatus> | null,
		) => {
			setCodeValues(nodePath, statuses);
		},
		[setCodeValues],
	);

	const setSubscriptionStateForSequence = useCallback(
		(nextState: NodePathsState) => {
			setOverrideIdToNodePath(overrideId, nextState);
		},
		[overrideId, setOverrideIdToNodePath],
	);

	const {previewServerState: state, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
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

	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const locationSource = validatedLocation?.source ?? null;
	const locationLine = validatedLocation?.line ?? null;
	const locationColumn = validatedLocation?.column ?? null;

	useEffect(() => {
		if (!visualModeEnabled) {
			throw new Error('Visual mode is not enabled');
		}

		if (
			!clientId ||
			!locationSource ||
			!locationLine ||
			locationColumn === null ||
			!schema
		) {
			return;
		}

		const onChange = (snapshot: SequencePropsSnapshot) => {
			setSubscriptionStateForSequence({
				nodePath: snapshot.nodePath,
				jsxInMapCallback: snapshot.jsxInMapCallback,
			});
			if (snapshot.nodePath) {
				setPropStatusesForSequence(snapshot.nodePath, snapshot.props);
			}
		};

		const release = acquireSequencePropsSubscription({
			clientId,
			fileName: locationSource,
			line: locationLine,
			column: locationColumn,
			schema,
			subscribeToEvent,
			onChange,
		});

		return () => {
			release();
			// Only clear props on true unmount, not on re-subscribe due to
			// location changes — avoids flicker while re-subscribing.
		};
	}, [
		clientId,
		locationColumn,
		locationLine,
		locationSource,
		schema,
		setPropStatusesForSequence,
		setSubscriptionStateForSequence,
		subscribeToEvent,
		visualModeEnabled,
	]);
};
