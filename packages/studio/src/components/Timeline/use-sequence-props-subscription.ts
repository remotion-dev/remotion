import {
	getAllSchemaKeys,
	stringifySequenceSubscriptionKey,
} from '@remotion/studio-shared';
import {useContext, useEffect, useMemo, useRef} from 'react';
import type {
	JsxComponentIdentity,
	SequencePropsSubscriptionKey,
	InteractivitySchema,
} from 'remotion';
import {Internals} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {ExpandedTracksSetterContext} from '../ExpandedTracksProvider';
import {acquireSequencePropsSubscription} from './sequence-props-subscription-store';

export const useSequencePropsSubscription = ({
	originalLocation,
	overrideId,
	componentIdentity,
	schema,
	effects,
}: {
	overrideId: string;
	componentIdentity: JsxComponentIdentity | null;
	schema: InteractivitySchema;
	effects: InteractivitySchema[];
	originalLocation: OriginalPosition | null;
}) => {
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
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
	const overrideIdToNodePathMappingsRef = useRef(overrideIdToNodePathMappings);
	overrideIdToNodePathMappingsRef.current = overrideIdToNodePathMappings;
	const clientId = state.type === 'connected' ? state.clientId : undefined;
	const videoConfig = Internals.useUnsafeVideoConfig();

	const effectsSignature = useMemo(
		() =>
			effects.map((effect) => getAllSchemaKeys(effect).join('\0')).join('\0\0'),
		[effects],
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

	useEffect(() => {
		if (
			!clientId ||
			!locationSource ||
			!locationLine ||
			locationColumn === null ||
			!schema ||
			videoConfig === null
		) {
			return;
		}

		const nodePathAtResubscribe =
			overrideIdToNodePathMappingsRef.current[overrideId] ?? null;

		const {release} = acquireSequencePropsSubscription({
			fileName: locationSource,
			line: locationLine,
			column: locationColumn,
			schema,
			componentIdentity,
			effects,
			nodePath: nodePathAtResubscribe?.nodePath ?? null,
			clientId,
			videoConfigValues: {
				durationInFrames: videoConfig.durationInFrames,
				fps: videoConfig.fps,
				height: videoConfig.height,
				width: videoConfig.width,
			},
			applyOnce: (result) => {
				if (!result.success) {
					return;
				}

				setPropStatuses(result.nodePath, () => result.status);
			},
			applyEach: (result) => {
				if (!result.success) {
					return;
				}

				const newNodePath = result.nodePath;
				const newNodePathKey = stringifySequenceSubscriptionKey(newNodePath);
				const previousNodePath =
					previousNodePathRef.current ?? nodePathAtResubscribe;
				const previousNodePathKey = previousNodePath
					? stringifySequenceSubscriptionKey(previousNodePath)
					: null;

				if (previousNodePathKey === newNodePathKey) {
					return;
				}

				if (previousNodePath) {
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
		componentIdentity,
		effects,
		effectsSignature,
		locationColumn,
		locationLine,
		locationSource,
		migrateExpandedTracksForSubscriptionKey,
		overrideId,
		schema,
		setPropStatuses,
		setOverrideIdToNodePath,
		videoConfig,
	]);
};
