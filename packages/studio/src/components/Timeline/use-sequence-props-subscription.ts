import {
	getAllSchemaKeys,
	stringifySequenceSubscriptionKey,
} from '@remotion/studio-shared';
import {
	type RefObject,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {
	JsxComponentIdentity,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
	InteractivitySchema,
} from 'remotion';
import {Internals} from 'remotion';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {copySourcePathProvenance} from '../../helpers/rebase-source-request';
import {hasSourceOnlyRemappings} from '../../helpers/sequence-node-path-mutations';
import {reconcileCanvasDragPreviewStatuses} from '../canvas-drag-preview';
import {ExpandedTracksSetterContext} from '../ExpandedTracksProvider';
import {deepEqual} from '../RenderModal/SchemaEditor/deep-equal';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {
	acquireSequencePropsSubscription,
	subscribeToSequencePropsRefresh,
} from './sequence-props-subscription-store';
import {shouldSubscribeToSourceFile} from './should-subscribe-to-source-file';
import {compiledSourceFrame} from './TimelineStack/get-stack';

export const useSequencePropsSubscription = ({
	originalLocation,
	overrideId,
	componentIdentity,
	schema,
	effects,
	preferMappedNodePath,
	stack,
	getStackRef,
}: {
	overrideId: string;
	componentIdentity: JsxComponentIdentity | null;
	schema: InteractivitySchema;
	effects: InteractivitySchema[];
	originalLocation: OriginalPosition | null;
	preferMappedNodePath: boolean;
	stack: string | null;
	getStackRef: RefObject<() => string | null>;
}) => {
	const {setPropStatuses, updateDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {setOverrideIdToNodePath} = useContext(
		Internals.OverrideIdsToNodePathsSettersContext,
	);
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
	);
	const {migrateExpandedTracksForSubscriptionKey} = useContext(
		ExpandedTracksSetterContext,
	);

	const {previewServerState: state} = useContext(StudioServerConnectionCtx);
	const pendingDeletions = Internals.usePendingSequenceDeletions();
	const [refreshToken, setRefreshToken] = useState(0);
	const remappedSource = useRef<{
		nodePath: SequenceNodePath;
		stack: string | null;
	} | null>(null);
	const previousNodePathRef = useRef<SequencePropsSubscriptionKey | null>(null);
	const clientId = state.type === 'connected' ? state.clientId : undefined;
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
		return subscribeToSequencePropsRefresh(overrideId, (nodePath) => {
			remappedSource.current = nodePath ? {nodePath, stack} : null;
			setRefreshToken((token) => token + 1);
		});
	}, [overrideId, stack]);

	useEffect(() => {
		// Optimistic deletion can remount siblings with stacks from the old source.
		// Wait for HMR before resolving those locations against the updated file.
		if (
			pendingDeletions.size > 0 ||
			!clientId ||
			!locationSource ||
			!shouldSubscribeToSourceFile(locationSource) ||
			!locationLine ||
			locationColumn === null ||
			!schema
		) {
			return;
		}

		const nodePathAtResubscribe =
			overrideIdToNodePathMappingsRef.current[overrideId] ?? null;
		const requestedNodePath =
			remappedSource.current?.stack === stack
				? remappedSource.current.nodePath
				: null;
		remappedSource.current = null;

		const liveStack = hasSourceOnlyRemappings(locationSource)
			? getStackRef.current()
			: null;
		const {release} = acquireSequencePropsSubscription({
			fileName: locationSource,
			line: locationLine,
			column: locationColumn,
			schema,
			componentIdentity,
			effects,
			nodePath:
				requestedNodePath ??
				(preferMappedNodePath
					? (nodePathAtResubscribe?.nodePath ?? null)
					: null),
			clientId,
			stack:
				stack !== null && liveStack?.startsWith(stack + compiledSourceFrame)
					? liveStack
					: stack,

			applyOnce: (result) => {
				if (!result.success) {
					return;
				}

				// Edits that shift source lines resubscribe every following node.
				const status = reconcileCanvasDragPreviewStatuses(
					updateDragOverrides,
					result.nodePath,
					result.status,
				);
				setPropStatuses(result.nodePath, (prev) =>
					deepEqual(prev, status) ? prev : status,
				);
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
					if (previousNodePath) {
						copySourcePathProvenance(
							newNodePath.nodePath,
							previousNodePath.nodePath,
						);
					}

					if (nodePathAtResubscribe) {
						copySourcePathProvenance(
							newNodePath.nodePath,
							nodePathAtResubscribe.nodePath,
						);
					}

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
		overrideIdToNodePathMappingsRef,
		preferMappedNodePath,
		pendingDeletions,
		refreshToken,
		schema,
		setPropStatuses,
		updateDragOverrides,
		setOverrideIdToNodePath,
		stack,
		getStackRef,
	]);
};
