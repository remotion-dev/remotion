import {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {pause} from '../api/pause';
import {seek} from '../api/seek';
import {useTimelineCalculator} from '../helpers/calculate-timeline';
import {getRelativeFileLocation} from '../helpers/format-file-location';
import {useSelectComposition} from './InitialCompositionLoader';
import {getCurrentFrame} from './Timeline/imperative-state';
import {
	getTimelineSelectionFromNodePathInfo,
	useCurrentTimelineSelectionStateAsRef,
} from './Timeline/TimelineSelection';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';

export type BufferingEvent = ReturnType<
	typeof Internals.bufferingDiagnostics.getSnapshot
>['events'][number];

export const getBufferingEvents = async ({
	limit,
	afterId,
}: {
	limit: number;
	afterId: number | null;
}) => {
	const snapshot = Internals.bufferingDiagnostics.getSnapshot();
	const events = snapshot.events
		.filter((event) => afterId === null || event.id > afterId)
		.slice(-limit);
	return {
		...snapshot,
		events: await Promise.all(
			events.map(async (event) => ({
				...event,
				durationInMilliseconds:
					(event.endedAt ?? performance.now()) - event.startedAt,
				handles: await Promise.all(
					event.handles.map(async (handle) => ({
						...handle,
						durationInMilliseconds:
							(handle.releasedAt ?? event.endedAt ?? performance.now()) -
							handle.createdAt,
						activeAtStart: handle.createdAt <= event.startedAt,
						owners: await Promise.all(
							handle.owners.map(async (owner) => {
								const location = owner.stack
									? await getOriginalLocationFromStack(
											owner.stack,
											'sequence',
										).catch(() => null)
									: null;
								const relative = getRelativeFileLocation({
									location,
									root: window.remotion_cwd ?? '',
								});
								return {
									...owner,
									location:
										relative === null
											? null
											: {...relative, column: location?.column ?? null},
								};
							}),
						),
					})),
				),
			})),
		),
	};
};

export const useRevealBufferingHandle = () => {
	const composition = useContext(Internals.CompositionManagerRefContext);
	const sequences = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const selection = useCurrentTimelineSelectionStateAsRef();
	const calculateTimeline = useTimelineCalculator();
	const selectComposition = useSelectComposition();

	return useCallback(
		async (eventId: number, handleId: number) => {
			const event = Internals.bufferingDiagnostics
				.getSnapshot()
				.events.find((item) => item.id === eventId);
			const handle = event?.handles.find((item) => item.id === handleId);
			if (!event || !handle)
				throw new Error('This buffering record is no longer available.');
			if (!selection.current.canSelect)
				throw new Error('Timeline selection is unavailable.');
			const target = composition.current.compositions.find(
				(item) => item.id === event.compositionId,
			);
			if (!target)
				throw new Error('The recorded composition is no longer available.');
			pause();
			const content = composition.current.canvasContent;
			if (
				content?.type !== 'composition' ||
				content.compositionId !== target.id
			) {
				selectComposition(target, true, event.frame);
			} else {
				seek(event.frame);
			}

			const deadline = performance.now() + 5000;
			do {
				await new Promise<void>((resolve) =>
					requestAnimationFrame(() => resolve()),
				);
				const current = composition.current.canvasContent;
				if (
					current?.type !== 'composition' ||
					current.compositionId !== target.id ||
					getCurrentFrame() !== event.frame
				)
					continue;
				const {tracks} = calculateTimeline({
					sequences: sequences.current,
					overrideIdsToNodePaths: overrideIdToNodePathMappings,
					compositions: composition.current.compositions,
					showConnectedCompositionChildren: true,
				});
				for (const owner of handle.owners) {
					const candidates = tracks.filter(
						({sequence}) =>
							sequence.id === owner.sequenceId ||
							(((owner.overrideId !== null &&
								sequence.controls?.overrideId === owner.overrideId) ||
								(owner.stack !== null &&
									sequence.getStack() === owner.stack)) &&
								(owner.source === null ||
									('src' in sequence && sequence.src === owner.source))),
					);
					const track =
						candidates.length === 1
							? candidates[0]
							: candidates.find(
									({sequence}) =>
										sequence.from <= event.frame &&
										sequence.from + sequence.duration > event.frame,
								);
					const item = getTimelineSelectionFromNodePathInfo(
						track?.nodePathInfo ?? null,
					);
					if (!track || item === null) continue;
					selection.current.selectItems([item], {
						reveal: true,
						revealInInspector: true,
					});
					return {
						compositionId: target.id,
						frame: event.frame,
						sequenceId: track.sequence.id,
					};
				}
			} while (performance.now() < deadline);

			throw new Error(
				'The recorded layer could not be found. Its captured source and call stack are still available in the trace.',
			);
		},
		[
			calculateTimeline,
			composition,
			overrideIdToNodePathMappings,
			selectComposition,
			selection,
			sequences,
		],
	);
};
