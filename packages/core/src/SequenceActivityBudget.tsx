import React, {createContext, useContext, useMemo, useState} from 'react';
import {createRegistryStore} from './registry-store.js';
import {SequenceActivityContext} from './sequence-activity-context.js';
import {TimelineContext, type TimelineContextValue} from './TimelineContext.js';
import {useSyncExternalStore} from './use-sync-external-store.js';

// Count nested dormant content too: one admitted scene must not be able to
// recursively mount another thousand expensive scenes behind its Activity.
const MAX_DORMANT_SEQUENCES = 20;
const useCommitEffect = React.useInsertionEffect ?? React.useLayoutEffect;

type ActivityCandidate = {
	readonly id: string;
	readonly parent: string | null;
	readonly compositionId: string;
	readonly from: number;
	readonly end: number;
};

const createActivityBudget = () => {
	const registry = createRegistryStore<ReadonlySet<string>>(new Set());
	const candidates = new Map<string, ActivityCandidate>();
	let frame: Record<string, number> = {};
	let scheduled = false;
	const schedule = () => {
		if (scheduled) {
			return;
		}

		scheduled = true;
		// Insertion effects run in hidden Activities too. Publish only after the
		// whole commit, once all candidates and the root playhead are current.
		queueMicrotask(() => {
			scheduled = false;
			const ranked = [...candidates.values()]
				.filter((candidate) => candidate.end > candidate.from)
				.map((candidate) => {
					const currentFrame = frame[candidate.compositionId] ?? 0;
					return {
						candidate,
						distance: Math.max(
							0,
							candidate.from - currentFrame,
							currentFrame - candidate.end,
						),
					};
				})
				.sort((a, b) => a.distance - b.distance);
			const selected = new Set<string>();
			for (const {candidate} of ranked) {
				const ancestors: string[] = [];
				let ancestor: ActivityCandidate | undefined = candidate;
				while (ancestor && !selected.has(ancestor.id)) {
					ancestors.push(ancestor.id);
					if (selected.size + ancestors.length > MAX_DORMANT_SEQUENCES) {
						break;
					}

					ancestor =
						ancestor.parent === null
							? undefined
							: candidates.get(ancestor.parent);
				}

				if (selected.size + ancestors.length > MAX_DORMANT_SEQUENCES) {
					continue;
				}

				for (const id of ancestors) {
					selected.add(id);
				}

				if (selected.size === MAX_DORMANT_SEQUENCES) {
					break;
				}
			}

			// Reserve nearby visible trees too, so becoming dormant retains their
			// state immediately. All other visible trees bypass admission. At most
			// 20 reserved IDs can become dormant, including during a large seek.
			registry.setSnapshot((previous) =>
				previous.size === selected.size &&
				[...previous].every((id) => selected.has(id))
					? previous
					: selected,
			);
		});
	};

	return {
		...registry,
		setFrame: (next: Record<string, number>) => {
			frame = next;
			schedule();
		},
		register: (candidate: ActivityCandidate) => {
			candidates.set(candidate.id, candidate);
			schedule();
			return () => {
				candidates.delete(candidate.id);
				schedule();
			};
		},
	};
};

const ActivityBudgetContext = createContext<ReturnType<
	typeof createActivityBudget
> | null>(null);
const InactiveTimelineContext = createContext<TimelineContextValue | null>(
	null,
);
const emptySelection: ReadonlySet<string> = new Set();
const ActivitySelectionContext = createContext(emptySelection);

export const SequenceActivityBudgetProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const enabled = useContext(SequenceActivityContext);
	const [budget] = useState(createActivityBudget);
	const timeline = useContext(
		enabled ? TimelineContext : InactiveTimelineContext,
	);
	const selected = useSyncExternalStore(
		budget.subscribe,
		budget.getSnapshot,
		budget.getSnapshot,
	);
	useCommitEffect(() => {
		if (enabled && timeline !== null) {
			budget.setFrame(timeline.frame);
		}
	}, [budget, enabled, timeline]);
	return (
		<ActivityBudgetContext.Provider value={enabled ? budget : null}>
			<ActivitySelectionContext.Provider value={selected}>
				{children}
			</ActivitySelectionContext.Provider>
		</ActivityBudgetContext.Provider>
	);
};

export const useSequenceActivityAdmission = (
	candidate: ActivityCandidate | null,
) => {
	const budget = useContext(ActivityBudgetContext);
	const selected = useContext(ActivitySelectionContext);
	const id = candidate?.id ?? null;
	const parent = candidate?.parent ?? null;
	const compositionId = candidate?.compositionId ?? null;
	const from = candidate?.from ?? null;
	const end = candidate?.end ?? null;
	const committedCandidate = useMemo(
		() =>
			id !== null && compositionId !== null && from !== null && end !== null
				? {id, parent, compositionId, from, end}
				: null,
		[id, parent, compositionId, from, end],
	);
	useCommitEffect(() => {
		if (budget !== null && committedCandidate !== null) {
			return budget.register(committedCandidate);
		}
	}, [budget, committedCandidate]);
	return id !== null && selected.has(id);
};
