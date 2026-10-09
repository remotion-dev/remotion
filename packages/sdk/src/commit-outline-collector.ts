import type {RefObject} from 'react';
import {Internals} from 'remotion';
import type {Fiber, CommittedMetadata} from './react-commit-types';

export type OutlineCollectors = readonly (Element | Text)[][] | null;

export const createCommitOutlineCollector = () => {
	const outlineNodesByRef = new Map<
		RefObject<Element | null>,
		(Element | Text)[]
	>();
	let outlineCollectionFailed = false;
	return {
		visit: (
			fiber: Fiber,
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
					const {tag} = fiber;
					const skipOutline =
						outlineCollectors === null ||
						(tag === 22 && fiber.memoizedState !== null);
					childOutlineCollectors = skipOutline
						? null
						: tag === 4
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
						(tag === 5 || tag === 6) &&
						fiber.stateNode !== null
					) {
						for (const collector of childOutlineCollectors) {
							collector.push(fiber.stateNode as Element | Text);
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
