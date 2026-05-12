import {useContext, useEffect, useMemo} from 'react';
import {Internals} from 'remotion';
import type {SequenceSchema} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {acquireSequencePropsSubscription} from './sequence-props-subscription-store';

export const useSequencePropsSubscription = ({
	originalLocation,
	overrideId,
	schema,
}: {
	overrideId: string;
	schema: SequenceSchema;
	originalLocation: OriginalPosition | null;
}) => {
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

	const locationSource = validatedLocation?.source ?? null;
	const locationLine = validatedLocation?.line ?? null;
	const locationColumn = validatedLocation?.column ?? null;

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
			clientId,
			applyOnce: (result) => {
				if (!result.canUpdate) {
					return;
				}

				setCodeValues(result.nodePath, result);
			},
			applyEach: (result) => {
				if (!result.canUpdate) {
					return;
				}

				setOverrideIdToNodePath(overrideId, result.nodePath);
			},
		});

		return () => {
			release();
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
	]);
};
