import type {EffectSubscription} from '@remotion/studio-shared';
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
	effects,
}: {
	overrideId: string;
	schema: SequenceSchema;
	effects: EffectSubscription[];
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

				setOverrideIdToNodePath(overrideId, result.nodePath);
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
		overrideId,
		schema,
		setCodeValues,
		setOverrideIdToNodePath,
	]);
};
