import {
	REACT_REFRESH_STARTED_EVENT,
	type EventSourceEvent,
} from '@remotion/studio-shared';
import {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import type {
	SequencePropsStatusRemapping,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {FastRefreshContext} from '../../fast-refresh-context';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {takePendingSequenceNodePathMutations} from '../../helpers/sequence-node-path-mutations';
import {ExpandedTracksSetterContext} from '../ExpandedTracksProvider';
import {deepEqual} from '../RenderModal/SchemaEditor/deep-equal';
import {refreshSequencePropsSubscription} from './sequence-props-subscription-store';
import {useTimelineSelection} from './TimelineSelection';

export const SequencePropsObserver = () => {
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const {remapPropStatuses, setPropStatuses} = useContext(
		Internals.VisualModeSettersContext,
	);
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
		return () => {
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
	useEffect(() => {
		const handleEvent = (event: EventSourceEvent) => {
			if (event.type !== 'sequence-props-updated') {
				return;
			}

			// Every save re-sends all subscribed nodes of the file. Keep unchanged
			// statuses so their consumers do not rerender.
			setPropStatuses(event.nodePath, (prev) =>
				deepEqual(prev, event.result) ? prev : event.result,
			);
		};

		const unsubscribe = subscribeToEvent('sequence-props-updated', handleEvent);

		return () => {
			unsubscribe();
		};
	}, [setPropStatuses, subscribeToEvent]);

	useLayoutEffect(() => {
		const mutations = takePendingSequenceNodePathMutations();
		if (mutations.length === 0) {
			return;
		}

		remapSelectionNodePaths(mutations);

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
		const overrideIdsToRefresh = new Set<string>();

		for (const [overrideId, previousNodePath] of Object.entries(
			overrideIdToNodePathMappingsRef.current,
		)) {
			let {nodePath} = previousNodePath;
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
			statusRemappings.push({
				previousNodePath,
				nodePath: nextNodePath,
				// A reused runtime instance still renders the old JSX until Refresh.
				// Let it use its JSX values instead of a shifted sibling's source props.
				result: nodePathChanged
					? null
					: (propStatusesRef.current[previousStatusKey] ?? null),
			});

			overrideUpdates.push({
				overrideId,
				nodePath: runtimeNodePathExists ? previousNodePath : nextNodePath,
			});
			if (
				!wasDeleted &&
				(nodePathChanged ||
					!runtimeNodePathExists ||
					runtimeNodePathNeedsRefresh)
			) {
				overrideIdsToRefresh.add(overrideId);
			}
		}

		remapPropStatuses(statusRemappings);

		for (const event of overrideUpdates) {
			setOverrideIdToNodePath(event.overrideId, event.nodePath);
		}

		for (const overrideId of overrideIdsToRefresh) {
			refreshSequencePropsSubscription(overrideId);
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
		migrateExpandedTracksForSubscriptionKey,
		propStatusesRef,
		remapSelectionNodePaths,
		remapPropStatuses,
		setOverrideIdToNodePath,
	]);

	return null;
};
