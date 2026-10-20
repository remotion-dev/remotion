import {
	getCommittedMetadata,
	type Fiber,
	type CommittedMetadata,
} from './react-commit-types';

export type FiberProjection = {
	readonly metadata: CommittedMetadata | null;
	readonly outline:
		| {readonly type: 'host'; readonly node: Element | Text}
		| {readonly type: 'portal' | 'hidden'}
		| null;
	readonly children: readonly FiberProjection[];
	readonly hasMetadata: boolean;
};

type CommittedFiberSnapshot = {
	readonly fiber: Fiber;
	readonly child: Fiber | null;
	readonly children: readonly CommittedFiberSnapshot[];
	readonly projectedChildren: readonly FiberProjection[];
	readonly projection: FiberProjection | null;
};

export type FiberProjectionCache = {
	current: CommittedFiberSnapshot | null;
};

export const projectCommittedFiberTree = (
	root: Fiber,
	cache: FiberProjectionCache | null,
) => {
	let outlineCollectionFailed = false;
	const visit = (
		fiber: Fiber,
		previous: CommittedFiberSnapshot | null,
	): CommittedFiberSnapshot => {
		const metadata = getCommittedMetadata(fiber.memoizedProps);
		let outline: FiberProjection['outline'] = null;
		if (!outlineCollectionFailed) {
			try {
				if (fiber.tag === 22 && fiber.memoizedState !== null) {
					outline = {type: 'hidden'};
				} else if (fiber.tag === 4) {
					outline = {type: 'portal'};
				} else if (
					(fiber.tag === 5 || fiber.tag === 6) &&
					fiber.stateNode !== null
				) {
					outline = {type: 'host', node: fiber.stateNode as Element | Text};
				}
			} catch {
				outlineCollectionFailed = true;
			}
		}

		let childSnapshots: readonly CommittedFiberSnapshot[];
		let projectedChildren: readonly FiberProjection[];
		if (previous !== null && previous.child === fiber.child) {
			// React clones the direct child list before rendering descendants. A
			// retained child pointer is its own bailout check. Keep snapshots in the
			// last committed tree, not a lifetime Fiber cache: alternates are recycled.
			childSnapshots = previous.children;
			projectedChildren = previous.projectedChildren;
		} else {
			const previousChildren = new Map(
				previous?.children.map((entry) => [entry.fiber, entry]),
			);
			const snapshots: CommittedFiberSnapshot[] = [];
			const next: FiberProjection[] = [];
			let {child} = fiber;
			while (child !== null) {
				const childSnapshot = visit(
					child,
					previousChildren.get(child) ??
						(child.alternate
							? (previousChildren.get(child.alternate) ?? null)
							: null),
				);
				snapshots.push(childSnapshot);
				if (childSnapshot.projection !== null) {
					next.push(childSnapshot.projection);
				}

				child = child.sibling;
			}

			childSnapshots = snapshots;
			projectedChildren = next;
		}

		let children = projectedChildren;
		if (outline !== null) {
			// Host nodes end the incoming DOM frontier; portals and hidden trees
			// cannot contribute to it. Only nested registration scopes remain useful.
			children = children.filter((child) => child.hasMetadata);
		}

		const hasMetadata =
			metadata !== null || children.some((child) => child.hasMetadata);
		const projection: FiberProjection | null =
			metadata === null && outline?.type !== 'host' && children.length === 0
				? null
				: metadata === null && outline === null && children.length === 1
					? children[0]
					: {metadata, outline, children, hasMetadata};
		return {
			fiber,
			child: fiber.child,
			children: childSnapshots,
			projectedChildren,
			projection,
		};
	};

	const snapshot = visit(root, cache?.current ?? null);
	if (cache !== null) {
		// Geometry failures must retry from live Fibers on the next commit.
		cache.current = outlineCollectionFailed ? null : snapshot;
	}

	return {projection: snapshot.projection, outlineCollectionFailed};
};
