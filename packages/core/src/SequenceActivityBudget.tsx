import React, {createContext, useContext, useMemo, useState} from 'react';
import {createRegistryStore} from './registry-store.js';
import {
	DEFAULT_SEQUENCE_ACTIVITY_LIMIT,
	SequenceActivityContext,
	SequenceActivitySettingsContext,
} from './sequence-activity-context.js';
import {TimelineContext, type TimelineContextValue} from './TimelineContext.js';
import {useSyncExternalStore} from './use-sync-external-store.js';

// Count nested dormant content too: one admitted scene must not be able to
// recursively mount another thousand expensive scenes behind its Activity.
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
	let limit = DEFAULT_SEQUENCE_ACTIVITY_LIMIT;
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
					if (selected.size + ancestors.length > limit) {
						break;
					}

					ancestor =
						ancestor.parent === null
							? undefined
							: candidates.get(ancestor.parent);
				}

				if (selected.size + ancestors.length > limit) {
					continue;
				}

				for (const id of ancestors) {
					selected.add(id);
				}

				if (selected.size === limit) {
					break;
				}
			}

			// Reserve nearby visible trees too, so becoming dormant retains their
			// state immediately. All other visible trees bypass admission. Reserved
			// IDs bound dormant content, including during a large seek.
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
		setLimit: (next: number) => {
			if (limit !== next) {
				limit = next;
				schedule();
			}
		},
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
	const settings = useContext(SequenceActivitySettingsContext);
	const limit = settings?.limit ?? DEFAULT_SEQUENCE_ACTIVITY_LIMIT;
	const admitting = enabled && limit > 0;
	const [budget] = useState(createActivityBudget);
	const timeline = useContext(
		admitting ? TimelineContext : InactiveTimelineContext,
	);
	const selected = useSyncExternalStore(
		budget.subscribe,
		budget.getSnapshot,
		budget.getSnapshot,
	);
	// Shrinking the setting must not keep the old, larger selection for a commit
	// while the budget schedules its new snapshot.
	const admitted = useMemo(
		() =>
			!admitting
				? emptySelection
				: selected.size > limit
					? new Set([...selected].slice(0, limit))
					: selected,
		[admitting, limit, selected],
	);
	useCommitEffect(() => {
		budget.setLimit(admitting ? limit : 0);
		if (admitting && timeline !== null) {
			budget.setFrame(timeline.frame);
		}
	}, [admitting, budget, limit, timeline]);
	return (
		<ActivityBudgetContext.Provider value={admitting ? budget : null}>
			<ActivitySelectionContext.Provider value={admitted}>
				{children}
			</ActivitySelectionContext.Provider>
		</ActivityBudgetContext.Provider>
	);
};

export const useSequenceActivityAdmission = (
	candidate: ActivityCandidate | null,
) => {
	const budget = useContext(ActivityBudgetContext);
	const enabled = useContext(SequenceActivityContext);
	const settings = useContext(SequenceActivitySettingsContext);
	const unlimited = enabled && settings?.limit === -1;
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
	// Unlimited discovery admits children on their first render, without waiting
	// for their registration and a subsequent budget publication.
	return id !== null && (unlimited || selected.has(id));
};
