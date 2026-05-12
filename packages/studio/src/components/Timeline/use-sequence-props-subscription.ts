import type {CanUpdateSequencePropsResponse} from '@remotion/studio-shared';
import {useContext, useEffect, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import type {SequenceSchema} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {acquireSequencePropsSubscription} from './sequence-props-subscription-store';

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

	const {previewServerState: state} = useContext(StudioServerConnectionCtx);
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

		const onChange = (snapshot: CanUpdateSequencePropsResponse) => {
			if (snapshot.canUpdate) {
				setOverrideIdToNodePath(overrideId, {
					nodePath: snapshot.nodePath,
					jsxInMapCallback: snapshot.jsxInMapCallback,
				});
				setCodeValues(snapshot.nodePath, snapshot.props);
			}
		};

		const release = acquireSequencePropsSubscription({
			clientId,
			fileName: locationSource,
			line: locationLine,
			column: locationColumn,
			schema,
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
		overrideId,
		schema,
		setCodeValues,
		setOverrideIdToNodePath,
		visualModeEnabled,
	]);
};
