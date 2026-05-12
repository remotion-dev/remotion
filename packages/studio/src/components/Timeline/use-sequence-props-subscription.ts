import {useContext, useEffect, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import type {SequenceSchema, SequenceNodePath} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {callApi} from '../call-api';

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

		let resolvedNodePath: SequenceNodePath | null = null;
		callApi('/api/subscribe-to-sequence-props', {
			fileName: locationSource,
			line: locationLine,
			column: locationColumn,
			schema,
			clientId,
		})
			.then((result) => {
				if (result.canUpdate) {
					resolvedNodePath = result.nodePath;

					setOverrideIdToNodePath(overrideId, {
						nodePath: result.nodePath,
						jsxInMapCallback: result.jsxInMapCallback,
					});
					setCodeValues(result.nodePath, result.props);
				}
			})
			.catch((err) => {
				Internals.Log.error(err);
			});

		return () => {
			if (resolvedNodePath) {
				callApi('/api/unsubscribe-from-sequence-props', {
					fileName: locationSource,
					nodePath: resolvedNodePath,
					clientId,
				}).catch(() => {
					// Ignore unsubscribe errors
				});
			}
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
