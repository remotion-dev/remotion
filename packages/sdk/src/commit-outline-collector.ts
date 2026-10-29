import type {RefObject} from 'react';
import {Internals} from 'remotion';
import type {FiberProjection} from './project-committed-fiber-tree';
import type {CommittedMetadata} from './react-commit-types';

export type OutlineCollectors = readonly (Element | Text)[][] | null;

export const createCommitOutlineCollector = (projectionFailed: boolean) => {
	const outlineNodesByRef = new Map<
		RefObject<Element | null>,
		(Element | Text)[]
	>();
	let outlineCollectionFailed = projectionFailed;
	return {
		visit: (
			fiber: FiberProjection,
			metadata: CommittedMetadata | null,
			outlineCollectors: OutlineCollectors,
		): OutlineCollectors => {
			let childOutlineCollectors = outlineCollectors;
			if (outlineCollectionFailed) {
				childOutlineCollectors = null;
			} else {
				try {
					// A portal ends the current DOM group, but can contain new sequences.
					// Hidden Offscreen trees must not contribute geometry, including new groups.
					const {outline} = fiber;
					const skipOutline =
						outlineCollectors === null || outline?.type === 'hidden';
					childOutlineCollectors = skipOutline
						? null
						: outline?.type === 'portal'
							? []
							: outlineCollectors;
					if (metadata?.type === 'sequence') {
						const outlineRef = metadata.outlineChildrenRef;
						if (outlineRef !== null) {
							const nodes: (Element | Text)[] = [];
							outlineNodesByRef.set(outlineRef, nodes);
							if (childOutlineCollectors !== null) {
								childOutlineCollectors = [...childOutlineCollectors, nodes];
							}
						}
					}

					if (
						childOutlineCollectors !== null &&
						childOutlineCollectors.length > 0 &&
						outline?.type === 'host'
					) {
						for (const collector of childOutlineCollectors) {
							collector.push(outline.node);
						}

						// Only first-level DOM nodes belong to this group. Keep traversing
						// for sequence order and for new groups nested inside this element.
						childOutlineCollectors = [];
					}
				} catch {
					// Discard incomplete geometry for this commit without losing registrations.
					// The next commit retries outline collection with a fresh map.
					outlineCollectionFailed = true;
					outlineNodesByRef.clear();
					childOutlineCollectors = null;
				}
			}

			return childOutlineCollectors;
		},
		publish: () => {
			for (const [ref, nodes] of outlineNodesByRef) {
				try {
					Internals.SequenceOutlineInternals.setNodes(ref, nodes);
				} catch {
					// A failed outline publication is retried on the next commit.
				}
			}

			return outlineNodesByRef.size;
		},
	};
};
