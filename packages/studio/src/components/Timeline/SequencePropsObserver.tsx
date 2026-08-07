import {type EventSourceEvent} from '@remotion/studio-shared';
import {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import type {
	SequencePropsStatusRemapping,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {FastRefreshContext} from '../../fast-refresh-context';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {takePendingSequenceNodePathMutations} from '../../helpers/sequence-node-path-mutations';
import {ExpandedTracksSetterContext} from '../ExpandedTracksProvider';

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
	const {migrateExpandedTracksForSubscriptionKey} = useContext(
		ExpandedTracksSetterContext,
	);
	useEffect(() => {
		const handleEvent = (event: EventSourceEvent) => {
			if (event.type !== 'sequence-props-updated') {
				return;
			}

			setPropStatuses(event.nodePath, () => event.result);
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

		const statusRemappings: SequencePropsStatusRemapping[] = [];
		const overrideUpdates: Array<{
			overrideId: string;
			nodePath: SequencePropsSubscriptionKey | null;
		}> = [];

		for (const [overrideId, previousNodePath] of Object.entries(
			overrideIdToNodePathMappingsRef.current,
		)) {
			let {nodePath} = previousNodePath;
			let wasRemapped = false;
			let wasDeleted = false;
			let runtimeNodePathExists = true;
			const previousNodePathString = JSON.stringify(previousNodePath.nodePath);

			for (const mutation of mutations) {
				for (const file of mutation.files) {
					if (file.absolutePath !== previousNodePath.absolutePath) {
						continue;
					}

					// Prop statuses follow source nodes to their new paths. Override IDs,
					// however, follow React's runtime instances. After deleting an unkeyed
					// sibling, React reuses the instance already at the destination path.
					// Keep that mapping in place and only remove mappings for vacated paths.
					const runtimeNodePathIsSource = file.remappings.some(
						(item) =>
							JSON.stringify(item.oldNodePath) === previousNodePathString,
					);
					const runtimeNodePathIsDestination = file.remappings.some(
						(item) =>
							item.newNodePath !== null &&
							JSON.stringify(item.newNodePath) === previousNodePathString,
					);
					const runtimeNodePathWasRestored = file.restoredNodePaths.some(
						(item) => JSON.stringify(item) === previousNodePathString,
					);
					if (runtimeNodePathIsSource) {
						runtimeNodePathExists =
							runtimeNodePathIsDestination || runtimeNodePathWasRestored;
					} else if (
						runtimeNodePathIsDestination ||
						runtimeNodePathWasRestored
					) {
						runtimeNodePathExists = true;
					}

					if (wasDeleted) {
						const wasRestored = file.restoredNodePaths.some(
							(restoredNodePath) =>
								JSON.stringify(restoredNodePath) === JSON.stringify(nodePath),
						);
						if (wasRestored) {
							wasDeleted = false;
						}

						continue;
					}

					const remapping = file.remappings.find(
						(item) =>
							JSON.stringify(item.oldNodePath) === JSON.stringify(nodePath),
					);
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
			const previousStatusKey =
				Internals.makeSequencePropsSubscriptionKey(previousNodePath);
			statusRemappings.push({
				previousNodePath,
				nodePath: nextNodePath,
				result: propStatusesRef.current[previousStatusKey] ?? null,
			});

			overrideUpdates.push({
				overrideId,
				nodePath: runtimeNodePathExists ? previousNodePath : null,
			});
		}

		remapPropStatuses(statusRemappings);

		for (const event of overrideUpdates) {
			setOverrideIdToNodePath(event.overrideId, event.nodePath);
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
		migrateExpandedTracksForSubscriptionKey,
		propStatusesRef,
		remapPropStatuses,
		setOverrideIdToNodePath,
	]);

	return null;
};
