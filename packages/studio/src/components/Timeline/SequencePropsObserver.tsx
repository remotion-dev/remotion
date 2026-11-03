import {
	REACT_REFRESH_STARTED_EVENT,
	type EventSourceEvent,
	type SequenceNodePathMutation,
} from '@remotion/studio-shared';
import {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import type {
	SequenceNodePath,
	SequencePropsStatusRemapping,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {FastRefreshContext} from '../../fast-refresh-context';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {markDuplicationSelectionMutationsApplied} from '../../helpers/duplicated-element-selection';
import {remapOptimisticEffectDeletions} from '../../helpers/effect-deletion-state';
import {subscribeToPreviewServerEvents} from '../../helpers/preview-server-events';
import {
	subscribeToInstalledMutationBuild,
	subscribeToSequenceNodePathMutations,
	takePendingSequenceNodePathMutations,
} from '../../helpers/sequence-node-path-mutations';
import {acceptSequencePropsSourceVersion} from '../../helpers/sequence-props-source-version';
import {
	reconcileCanvasDragPreviewStatuses,
	resetCanvasDragPreviewsForSourceSession,
	remapCanvasDragPreviews,
} from '../canvas-drag-preview';
import {ExpandedTracksSetterContext} from '../ExpandedTracksProvider';
import {deepEqual} from '../RenderModal/SchemaEditor/deep-equal';
import {refreshSequencePropsSubscription} from './sequence-props-subscription-store';
import {useTimelineSelection} from './TimelineSelection';

export const SequencePropsObserver = ({
	remapCollapsedLayers,
}: {
	readonly remapCollapsedLayers: (
		mutations: SequenceNodePathMutation[],
	) => void;
}) => {
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const visualModeSetters = useContext(Internals.VisualModeSettersContext);
	const {
		remapPropStatuses,
		setPropStatuses,
		setPropStatusesBatch,
		updateDragOverrides,
		remapDragOverrideFields,
		remapEffectDragOverrideFields,
	} = visualModeSetters;
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const overrideIdToNodePathMappingsRef = useRef(overrideIdToNodePathMappings);
	overrideIdToNodePathMappingsRef.current = overrideIdToNodePathMappings;
	const {setOverrideIdToNodePath} = useContext(
		Internals.OverrideIdsToNodePathsSettersContext,
	);
	const {fastRefreshes} = useContext(FastRefreshContext);
	const [fastRefreshStarts, setFastRefreshStarts] = useState(0);
	const [sourceOnlyMutations, setSourceOnlyMutations] = useState(0);
	const lastRefresh = useRef<{started: number; completed: number} | null>(null);
	useEffect(
		() =>
			subscribeToSequenceNodePathMutations((mutation) => {
				if (mutation.applyWithoutFastRefresh) {
					setSourceOnlyMutations((count) => count + 1);
					return;
				}

				for (const file of mutation.files) {
					const positions = new Map<string, {line: number; column: number}>();
					for (const {sourceLocations} of file.remappings) {
						if (!sourceLocations?.before || !sourceLocations.after) continue;
						const {before, after} = sourceLocations;
						if (before.line !== after.line || before.column !== after.column)
							positions.set(`${before.line}:${before.column}`, after);
					}

					if (positions.size === 0) continue;
					const seen = new Set<string>();
					const updates: Array<
						Parameters<typeof setPropStatusesBatch>[0][number]
					> = [];
					for (const nodePath of Object.values(
						overrideIdToNodePathMappingsRef.current,
					)) {
						if (nodePath.absolutePath !== file.absolutePath) continue;
						const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
						if (seen.has(key)) continue;
						seen.add(key);
						updates.push({
							nodePath,
							update: (previous) => {
								if (!previous?.canUpdate || !previous.sourceLocation)
									return previous;
								const {line, column} = previous.sourceLocation;
								const next = positions.get(`${line}:${column}`);
								return next ? {...previous, sourceLocation: next} : previous;
							},
						});
					}

					setPropStatusesBatch(updates);
				}
			}),
		[setPropStatusesBatch],
	);
	useEffect(() => {
		const handleReactRefreshStarted = () => {
			// Apply source-node remappings immediately before React commits the
			// refreshed tree. This keeps the old tree paired with the old statuses
			// and the new tree paired with the remapped statuses in the same task.
			flushSync(() => {
				setFastRefreshStarts((starts) => starts + 1);
			});
		};

		window.addEventListener(
			REACT_REFRESH_STARTED_EVENT,
			handleReactRefreshStarted,
		);
		const unsubscribe = subscribeToInstalledMutationBuild(() => {
			setFastRefreshStarts((starts) => starts + 1);
		});
		return () => {
			unsubscribe();
			window.removeEventListener(
				REACT_REFRESH_STARTED_EVENT,
				handleReactRefreshStarted,
			);
		};
	}, []);
	const {migrateExpandedTracksForSubscriptionKey} = useContext(
		ExpandedTracksSetterContext,
	);
	const {remapSelectionNodePaths} = useTimelineSelection();
	useEffect(
		() =>
			subscribeToPreviewServerEvents((event) => {
				if (event.type === 'init')
					resetCanvasDragPreviewsForSourceSession(
						visualModeSetters,
						event.sourceVersionSessionId,
					);
			}),
		[visualModeSetters],
	);
	useEffect(() => {
		const handleEvent = (event: EventSourceEvent) => {
			if (event.type !== 'sequence-props-updated') {
				return;
			}

			if (
				!acceptSequencePropsSourceVersion(
					updateDragOverrides,
					event.nodePath,
					event.sourceVersion,
				)
			)
				return;

			// Every save re-sends all subscribed nodes of the file. Keep unchanged
			// statuses so their consumers do not rerender.
			const result = reconcileCanvasDragPreviewStatuses(
				updateDragOverrides,
				event.nodePath,
				event.result,
			);
			setPropStatuses(event.nodePath, (prev) =>
				deepEqual(prev, result) ? prev : result,
			);
		};

		const unsubscribe = subscribeToEvent('sequence-props-updated', handleEvent);

		return () => {
			unsubscribe();
		};
	}, [setPropStatuses, subscribeToEvent, updateDragOverrides]);

	useLayoutEffect(() => {
		const onlyWithoutFastRefresh =
			lastRefresh.current?.started === fastRefreshStarts &&
			lastRefresh.current.completed === fastRefreshes;
		lastRefresh.current = {
			started: fastRefreshStarts,
			completed: fastRefreshes,
		};
		const {mutations: settled, changes: mutations} =
			takePendingSequenceNodePathMutations(onlyWithoutFastRefresh);
		if (settled.length === 0) {
			return;
		}

		markDuplicationSelectionMutationsApplied(settled, fastRefreshes);
		if (mutations.length === 0) return;

		remapCanvasDragPreviews(
			{
				updateDragOverrides,
				remapDragOverrideFields,
				remapEffectDragOverrideFields,
			},
			mutations,
		);
		for (const mutation of mutations) remapOptimisticEffectDeletions(mutation);
		remapSelectionNodePaths(mutations);
		remapCollapsedLayers(mutations);

		// Each edit can remap many siblings. Index paths once before matching
		// them against every mounted override ID.
		const indexedMutations = mutations.map((mutation) =>
			mutation.files.map((file) => {
				const byOldPath = new Map<string, (typeof file.remappings)[number]>();
				const byNewPath = new Map<string, (typeof file.remappings)[number]>();
				const insertedPaths = new Set<string>();
				const updatedPaths = new Set<string>();
				for (const remapping of file.remappings) {
					const oldPath =
						remapping.oldNodePath === null
							? null
							: JSON.stringify(remapping.oldNodePath);
					const newPath =
						remapping.newNodePath === null
							? null
							: JSON.stringify(remapping.newNodePath);

					// Preserve the first match when multiple remappings share a path.
					if (oldPath !== null && !byOldPath.has(oldPath)) {
						byOldPath.set(oldPath, remapping);
					}

					if (newPath !== null && !byNewPath.has(newPath)) {
						byNewPath.set(newPath, remapping);
					}

					if (oldPath === null && newPath !== null) {
						insertedPaths.add(newPath);
					}

					if (oldPath !== null && oldPath === newPath) {
						updatedPaths.add(oldPath);
					}
				}

				return {
					absolutePath: file.absolutePath,
					byOldPath,
					byNewPath,
					insertedPaths,
					updatedPaths,
				};
			}),
		);

		const statusRemappings: SequencePropsStatusRemapping[] = [];
		const overrideUpdates: Array<{
			overrideId: string;
			nodePath: SequencePropsSubscriptionKey | null;
		}> = [];
		const overrideIdsToRefresh = new Map<string, SequenceNodePath | null>();

		for (const [overrideId, previousNodePath] of Object.entries(
			overrideIdToNodePathMappingsRef.current,
		)) {
			let {nodePath} = previousNodePath;
			let sourceLocation: {line: number; column: number} | null = null;
			let wasRemapped = false;
			let wasDeleted = false;
			let runtimeNodePathExists = true;
			let runtimeNodePathNeedsRefresh = false;
			const previousNodePathString = JSON.stringify(previousNodePath.nodePath);

			for (const files of indexedMutations) {
				for (const file of files) {
					if (file.absolutePath !== previousNodePath.absolutePath) {
						continue;
					}

					// Source nodes and React's runtime instances can move independently.
					// Override IDs follow runtime instances, which may be reused when the
					// same JSX component takes over an old path. A different component remounts,
					// so move the old mapping with its source node and resubscribe instead.
					const runtimeNodePathSource = file.byOldPath.get(
						previousNodePathString,
					);
					const runtimeNodePathDestination = file.byNewPath.get(
						previousNodePathString,
					);
					const replacementComponentMatches =
						runtimeNodePathSource?.oldJsxName === undefined ||
						runtimeNodePathDestination?.newJsxName === undefined ||
						runtimeNodePathSource.oldJsxName ===
							runtimeNodePathDestination.newJsxName;
					const runtimeNodePathWasInserted = file.insertedPaths.has(
						previousNodePathString,
					);
					const runtimeNodePathWasUpdated = file.updatedPaths.has(
						previousNodePathString,
					);
					if (runtimeNodePathSource) {
						runtimeNodePathExists = Boolean(
							runtimeNodePathDestination && replacementComponentMatches,
						);
						runtimeNodePathNeedsRefresh =
							runtimeNodePathExists &&
							(runtimeNodePathWasInserted || runtimeNodePathWasUpdated);
					} else if (runtimeNodePathDestination) {
						runtimeNodePathExists = true;
						runtimeNodePathNeedsRefresh =
							runtimeNodePathWasInserted || runtimeNodePathWasUpdated;
					}

					if (wasDeleted) {
						continue;
					}

					const remapping = file.byOldPath.get(JSON.stringify(nodePath));
					if (!remapping) {
						continue;
					}

					wasRemapped = true;
					sourceLocation = remapping.sourceLocations?.after ?? null;
					if (remapping.newNodePath === null) {
						wasDeleted = true;
						continue;
					}

					nodePath = remapping.newNodePath;
				}
			}

			if (!wasRemapped) {
				continue;
			}

			const nextNodePath = wasDeleted ? null : {...previousNodePath, nodePath};
			const nodePathChanged =
				JSON.stringify(nodePath) !== previousNodePathString;
			const previousStatusKey =
				Internals.makeSequencePropsSubscriptionKey(previousNodePath);
			const previousStatus = propStatusesRef.current[previousStatusKey] ?? null;
			let result = nodePathChanged ? null : previousStatus;
			if (
				sourceLocation &&
				previousStatus?.canUpdate &&
				(!nodePathChanged || !runtimeNodePathExists)
			) {
				result = {...previousStatus, sourceLocation};
			}

			statusRemappings.push({
				previousNodePath,
				nodePath: nextNodePath,
				result,
			});

			overrideUpdates.push({
				overrideId,
				nodePath: runtimeNodePathExists ? previousNodePath : nextNodePath,
			});
			if (
				runtimeNodePathNeedsRefresh ||
				(!wasDeleted && (nodePathChanged || !runtimeNodePathExists))
			) {
				overrideIdsToRefresh.set(
					overrideId,
					onlyWithoutFastRefresh
						? (nextNodePath ?? previousNodePath).nodePath
						: null,
				);
			}
		}

		remapPropStatuses(statusRemappings);

		for (const event of overrideUpdates) {
			setOverrideIdToNodePath(event.overrideId, event.nodePath);
		}

		for (const [overrideId, nodePath] of overrideIdsToRefresh) {
			refreshSequencePropsSubscription(overrideId, nodePath);
		}

		for (const event of statusRemappings) {
			if (event.nodePath === null) {
				continue;
			}

			migrateExpandedTracksForSubscriptionKey(
				event.previousNodePath,
				event.nodePath,
			);
		}
	}, [
		fastRefreshes,
		fastRefreshStarts,
		sourceOnlyMutations,
		migrateExpandedTracksForSubscriptionKey,
		propStatusesRef,
		remapSelectionNodePaths,
		remapCollapsedLayers,
		remapPropStatuses,
		updateDragOverrides,
		remapDragOverrideFields,
		remapEffectDragOverrideFields,
		setOverrideIdToNodePath,
	]);

	return null;
};
