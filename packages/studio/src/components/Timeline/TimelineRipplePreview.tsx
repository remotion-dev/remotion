import React, {
	useContext,
	useLayoutEffect,
	useMemo,
	type ContextType,
} from 'react';
import {Internals} from 'remotion';
import {createTimelineRipplePreview} from './get-timeline-ripple-preview';

type Registry = NonNullable<
	ContextType<typeof Internals.SequenceRegistryContext>
>;
type RipplePreview = {
	readonly update: (duration: number) => boolean;
	readonly finish: () => void;
	readonly cancel: () => void;
	readonly saved: () => void;
};
type BeginPreview = (
	options: Omit<
		Parameters<typeof createTimelineRipplePreview>[0],
		'sequences'
	> & {
		readonly onInvalidated: (duration: number) => void;
	},
) => RipplePreview | null;

export const TimelineRipplePreviewContext = React.createContext<BeginPreview>(
	() => null,
);

// The editor owns its temporary timing snapshot. Composition rendering is only
// needed to reconcile the completed edit, not to move a boundary under the mouse.
export const TimelineRipplePreviewProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const source = useContext(Internals.SequenceRegistryContext);
	const compositionId = Internals.useVideo()?.id ?? null;
	const controller = useMemo(() => {
		if (source === null || compositionId === null) {
			return null;
		}

		let snapshot = source.getSnapshot();
		const listeners = new Set<() => void>();
		type Transaction = {
			readonly model: NonNullable<
				ReturnType<typeof createTimelineRipplePreview>
			>;
			readonly initial: ReturnType<Registry['getSnapshot']>;
			readonly onInvalidated: (duration: number) => void;
			pending: ReturnType<Registry['getSnapshot']> | null;
			duration: number;
			committing: boolean;
		};
		let transaction: Transaction | null = null;
		let animationFrame: number | null = null;
		let reconciliationTimeout: ReturnType<typeof setTimeout> | null = null;
		const publish = (next: typeof snapshot) => {
			if (snapshot === next) {
				return;
			}

			snapshot = next;
			for (const listener of [...listeners]) {
				listener();
			}
		};

		const flush = () => {
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
				animationFrame = null;
			}

			if (transaction?.pending) {
				const {pending} = transaction;
				transaction.pending = null;
				publish(pending);
			}
		};

		const reset = () => {
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
				animationFrame = null;
			}

			if (reconciliationTimeout !== null) {
				clearTimeout(reconciliationTimeout);
				reconciliationTimeout = null;
			}

			transaction = null;
			publish(source.getSnapshot());
		};

		const onSourceChange = () => {
			const live = source.getSnapshot();
			if (transaction === null) {
				publish(live);
				return;
			}

			const target = live.find(
				(sequence) => sequence.id === transaction?.model.sequenceId,
			);
			if (transaction.committing) {
				// The runtime may legitimately discover a different child tree after
				// user code reacts to the new duration. Its committed model wins.
				if (
					!target ||
					(target.intrinsicDuration !== null &&
						target.intrinsicDuration !== undefined &&
						Math.abs(target.intrinsicDuration - transaction.duration) <=
							Number.EPSILON * Math.max(1, Math.abs(transaction.duration)) * 8)
				) {
					reset();
				}

				return;
			}

			// Seeking, hot reload, or background discovery can invalidate the
			// captured topology. Replay the current duration immediately so holding
			// the pointer still cannot leave the boundary at its original position.
			const before = transaction.initial;
			if (
				live.length !== before.length ||
				live.some((sequence, index) => sequence !== before[index])
			) {
				const invalidated = transaction;
				reset();
				if (target && transaction === null) {
					invalidated.onInvalidated(invalidated.duration);
				}
			}
		};

		const begin: BeginPreview = (options) => {
			if (transaction?.committing) {
				reset();
			}

			if (transaction !== null) {
				return null;
			}

			const initial = source.getSnapshot();
			const {onInvalidated, ...modelOptions} = options;
			const model = createTimelineRipplePreview({
				...modelOptions,
				sequences: initial,
			});
			if (model === null) {
				return null;
			}

			const current: Transaction = {
				model,
				initial,
				onInvalidated,
				pending: null,
				duration: options.initialDuration,
				committing: false,
			};
			transaction = current;
			return {
				update: (duration) => {
					if (transaction !== current || current.committing) {
						return false;
					}

					if (duration === current.duration) {
						return true;
					}

					const next = model.project(duration);
					if (next === null) {
						reset();
						return false;
					}

					current.duration = duration;
					current.pending = next;
					if (animationFrame === null) {
						animationFrame = requestAnimationFrame(flush);
					}

					return true;
				},
				finish: () => {
					if (transaction !== current) {
						return;
					}

					flush();
					current.committing = true;
					onSourceChange();
				},
				cancel: () => {
					if (transaction === current) {
						reset();
					}
				},
				saved: () => {
					if (transaction !== current) {
						return;
					}

					// A source transform can produce a different duration than the
					// requested one. Never retain an optimistic model indefinitely.
					reconciliationTimeout = setTimeout(() => {
						if (transaction === current) {
							reset();
						}
					}, 1000);
				},
			};
		};

		const registry: Registry = {
			getSnapshot: () => snapshot,
			subscribe: (listener) => {
				listeners.add(listener);
				return () => listeners.delete(listener);
			},
			setSnapshot: source.setSnapshot,
		};
		const ref = {
			get current() {
				return snapshot;
			},
		};
		return {registry, ref, begin, onSourceChange, reset};
		// A composition switch ends the transaction without replaying its edit
		// against the newly selected composition, even if React reused a sequence.
	}, [compositionId, source]);

	useLayoutEffect(() => {
		if (source === null || controller === null) {
			return;
		}

		const unsubscribe = source.subscribe(controller.onSourceChange);
		controller.onSourceChange();
		return () => {
			unsubscribe();
			controller.reset();
		};
	}, [source, controller]);

	if (controller === null) {
		return children;
	}

	return (
		<TimelineRipplePreviewContext.Provider value={controller.begin}>
			<Internals.SequenceRegistryContext.Provider value={controller.registry}>
				<Internals.SequenceManagerRefContext.Provider value={controller.ref}>
					{children}
				</Internals.SequenceManagerRefContext.Provider>
			</Internals.SequenceRegistryContext.Provider>
		</TimelineRipplePreviewContext.Provider>
	);
};
