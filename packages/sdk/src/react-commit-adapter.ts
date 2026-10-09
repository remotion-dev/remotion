import {Internals} from 'remotion';
import {
	createCommitOutlineCollector,
	type OutlineCollectors,
} from './commit-outline-collector';
import {
	createCommitRegistryCollector,
	type CommittedSequenceRegistration,
	type CommittedCompositionRegistration,
} from './commit-registry-collector';
import {
	projectCommittedFiberTree,
	type FiberProjection,
	type FiberProjectionCache,
} from './project-committed-fiber-tree';
import {type FiberRoot, type HookTarget} from './react-commit-types';
const {installationMarker} = Internals.CommittedMetadataInternals;
// Share a cached projection of the committed tree between registration and DOM discovery.
export const collectReactCommit = (
	root: FiberRoot,
	registrations: Map<string, CommittedSequenceRegistration> | null = null,
	previousRegistrations: ReadonlyMap<
		string,
		CommittedSequenceRegistration
	> | null = null,
	compositionRegistry: {
		readonly registrations: Map<string, CommittedCompositionRegistration>;
		readonly previous: ReadonlyMap<
			string,
			CommittedCompositionRegistration
		> | null;
	} | null = null,
	projectionCache: FiberProjectionCache | null = null,
) => {
	const projected = projectCommittedFiberTree(root.current, projectionCache);
	const registry = createCommitRegistryCollector(
		registrations,
		previousRegistrations,
		compositionRegistry,
	);
	const outlines = createCommitOutlineCollector(
		projected.outlineCollectionFailed,
	);
	const visit = (
		fiber: FiberProjection,
		currentSequenceManagerId: string | null,
		currentCompositionManagerId: string | null,
		outlineCollectors: OutlineCollectors,
	) => {
		const {metadata} = fiber;
		if (!fiber.hasMetadata && !outlineCollectors?.length) {
			return;
		}

		const sequenceManagerId =
			metadata?.type === 'sequence-manager'
				? metadata.id
				: currentSequenceManagerId;
		const compositionManagerId =
			metadata?.type === 'composition-manager'
				? metadata.id
				: currentCompositionManagerId;
		registry.visit(metadata, sequenceManagerId, compositionManagerId);
		const childOutlines =
			outlineCollectors === null && metadata === null
				? null
				: outlines.visit(fiber, metadata, outlineCollectors);
		for (const child of fiber.children) {
			visit(child, sequenceManagerId, compositionManagerId, childOutlines);
		}
	};

	if (projected.projection !== null) {
		visit(projected.projection, null, null, []);
	}

	return {...registry.getSnapshot(), outlineCount: outlines.publish()};
};

export const installReactCommitObserver = (target: HookTarget): boolean => {
	const hook = target.__REACT_DEVTOOLS_GLOBAL_HOOK__;
	if (!hook?.supportsFiber) {
		return false;
	}

	if (hook[installationMarker] === true) {
		return true;
	}

	const previousOnCommitFiberRoot = hook.onCommitFiberRoot;
	const registrationsByRoot = new WeakMap<
		FiberRoot,
		Map<string, CommittedSequenceRegistration>
	>();
	const compositionRegistrationsByRoot = new WeakMap<
		FiberRoot,
		Map<string, CommittedCompositionRegistration>
	>();

	const projectionCachesByRoot = new WeakMap<FiberRoot, FiberProjectionCache>();

	hook.onCommitFiberRoot = function (...args) {
		let order: ReturnType<typeof collectReactCommit> | null = null;
		try {
			const [, root] = args;
			const projectionCache = projectionCachesByRoot.get(root) ?? {
				current: null,
			};
			projectionCachesByRoot.set(root, projectionCache);
			const registrations = new Map<string, CommittedSequenceRegistration>();
			const previousRegistrations = registrationsByRoot.get(root);
			const compositionRegistrations = new Map<
				string,
				CommittedCompositionRegistration
			>();
			const previousCompositionRegistrations =
				compositionRegistrationsByRoot.get(root);
			order = collectReactCommit(
				root,
				registrations,
				previousRegistrations ?? null,
				{
					registrations: compositionRegistrations,
					previous: previousCompositionRegistrations ?? null,
				},
				projectionCache,
			);
			registrationsByRoot.set(root, registrations);
			compositionRegistrationsByRoot.set(root, compositionRegistrations);
			for (const [managerId, registration] of registrations) {
				if (registration !== previousRegistrations?.get(managerId)) {
					registration.onCommit(
						registration.sequences,
						registration.sequenceIds,
					);
				}
			}

			if (previousRegistrations) {
				for (const [managerId, registration] of previousRegistrations) {
					if (!registrations.has(managerId)) {
						registration.onCommit([], []);
					}
				}
			}

			for (const [managerId, registration] of compositionRegistrations) {
				if (registration !== previousCompositionRegistrations?.get(managerId)) {
					registration.onCommit(registration.snapshot);
				}
			}

			if (previousCompositionRegistrations) {
				for (const [
					managerId,
					registration,
				] of previousCompositionRegistrations) {
					if (!compositionRegistrations.has(managerId)) {
						registration.onCommit({
							compositions: [],
							folders: [],
							orderIds: [],
						});
					}
				}
			}
		} catch {
			// A registration collection or delivery failure permanently selects effect
			// fallback for this hook. Retrying registration would risk repeated teardown.
			projectionCachesByRoot.delete(args[1]);
			hook[Internals.CommittedMetadataInternals.failureMarker] = true;
			order = null;
			try {
				target.dispatchEvent(
					new CustomEvent(
						Internals.CommittedMetadataInternals.registrationErrorEventName,
					),
				);
			} catch {
				// Notification failure must not prevent the previous hook from running.
			}
		}

		if (
			order !== null &&
			(order.outlineCount > 0 || order.sequenceManagers.length > 0)
		) {
			try {
				target.dispatchEvent(
					new CustomEvent(Internals.CommittedMetadataInternals.eventName, {
						detail: {
							sequenceManagers: order.sequenceManagers,
						},
					}),
				);
			} catch {
				// Order notifications are independent of registration and retry next commit.
			}
		}

		return previousOnCommitFiberRoot?.apply(this, args);
	};

	hook[installationMarker] = true;
	return true;
};
