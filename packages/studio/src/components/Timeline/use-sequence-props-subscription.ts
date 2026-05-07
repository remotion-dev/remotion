import type {SequenceNodePath} from '@remotion/studio-shared';
import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals, type CanUpdateSequencePropStatus} from 'remotion';
import type {TSequence} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	acquireSequencePropsSubscription,
	type SequencePropsSnapshot,
} from './sequence-props-subscription-store';

const EMPTY_STATE = {
	nodePath: null as SequenceNodePath | null,
	jsxInMapCallback: false,
};

export const useSequencePropsSubscription = (
	sequence: TSequence,
	originalLocation: OriginalPosition | null,
	visualModeEnabled: boolean,
): {
	nodePath: SequenceNodePath | null;
	jsxInMapCallback: boolean;
} => {
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

	const [subscriptionState, setSubscriptionState] =
		useState<typeof EMPTY_STATE>(EMPTY_STATE);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const schema = sequence.controls?.schema;
	const locationSource = validatedLocation?.source ?? null;
	const locationLine = validatedLocation?.line ?? null;
	const locationColumn = validatedLocation?.column ?? null;

	useEffect(() => {
		if (!visualModeEnabled) {
			setPropStatusesForSequence(null);
			setSubscriptionState(EMPTY_STATE);
			return;
		}

		if (
			!clientId ||
			!locationSource ||
			!locationLine ||
			locationColumn === null ||
			!schema
		) {
			setPropStatusesForSequence(null);
			setSubscriptionState(EMPTY_STATE);
			return;
		}

		const onChange = (snapshot: SequencePropsSnapshot) => {
			setSubscriptionState({
				nodePath: snapshot.nodePath,
				jsxInMapCallback: snapshot.jsxInMapCallback,
			});
			setPropStatusesForSequence(snapshot.props);
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
			if (!isMountedRef.current) {
				setPropStatusesForSequence(null);
			}
		};
	}, [
		clientId,
		locationColumn,
		locationLine,
		locationSource,
		schema,
		setPropStatusesForSequence,
		subscribeToEvent,
		visualModeEnabled,
	]);

	return subscriptionState;
};
