import {useCallback, useContext} from 'react';
import type {
	CanUpdateSequencePropStatus,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useMediaMetadata} from '../../helpers/use-media-metadata';
import {useRuntimeValueSelector} from '../../helpers/use-runtime-values';
import {SetSelectedModalContext} from '../../state/modals';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {getPlaybackRateKeyframeChanges} from './get-playback-rate-keyframe-changes';
import {getTimelineMediaStartFrame} from './get-timeline-media-start-frame';
import {
	saveSequenceProps,
	type SaveSequencePropChange,
	type SetPropStatuses,
} from './save-sequence-prop';

const isClose = (first: number, second: number) =>
	Math.abs(first - second) <=
	Number.EPSILON * Math.max(1, Math.abs(first), Math.abs(second)) * 4;

export const useSequenceChangeSpeedMenuItem = ({
	nodePath,
	propStatusesForOverride,
	sequence,
	sequenceFrameOffset,
	setPropStatuses,
	validatedSource,
}: {
	readonly nodePath: SequencePropsSubscriptionKey | null;
	readonly propStatusesForOverride:
		| Record<string, CanUpdateSequencePropStatus>
		| undefined;
	readonly sequence: TSequence;
	readonly sequenceFrameOffset: number;
	readonly setPropStatuses: SetPropStatuses;
	readonly validatedSource: string | null;
}): ComboboxValue | null => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const video = Internals.useVideo();
	const mediaMetadata = useMediaMetadata(
		sequence.type === 'audio' || sequence.type === 'video'
			? sequence.src
			: null,
	);
	const runtimeValues = useRuntimeValueSelector({
		controls: sequence.controls,
		selector: (values) => ({
			loop: values.loop === true,
			playbackRate:
				typeof values.playbackRate === 'number'
					? values.playbackRate
					: sequence.type === 'audio' || sequence.type === 'video'
						? sequence.playbackRate
						: 1,
			trimAfter: typeof values.trimAfter === 'number' ? values.trimAfter : null,
			trimBefore: typeof values.trimBefore === 'number' ? values.trimBefore : 0,
		}),
		isEqual: (first, second) =>
			first.loop === second.loop &&
			first.playbackRate === second.playbackRate &&
			first.trimAfter === second.trimAfter &&
			first.trimBefore === second.trimBefore,
	});

	const isMedia = sequence.type === 'audio' || sequence.type === 'video';
	const supportsSpeedChange =
		sequence.controls?.schema.playbackRate !== undefined;
	const playbackRateStatus = propStatusesForOverride?.playbackRate;
	const durationStatus = propStatusesForOverride?.durationInFrames;
	const trimAfterStatus = propStatusesForOverride?.trimAfter;
	const trimAfterCanBeUpdated =
		runtimeValues.trimAfter === null || trimAfterStatus?.status === 'static';
	const canChangeSpeed = Boolean(
		supportsSpeedChange &&
		video &&
		(!isMedia || mediaMetadata) &&
		Number.isFinite(sequence.duration) &&
		sequence.duration > 0 &&
		!runtimeValues.loop &&
		sequence.frozenFrame === null &&
		nodePath &&
		validatedSource &&
		sequence.controls &&
		previewServerState.type === 'connected' &&
		playbackRateStatus?.status === 'static' &&
		durationStatus?.status === 'static' &&
		trimAfterCanBeUpdated,
	);

	const onChangeSpeed = useCallback(() => {
		if (
			!canChangeSpeed ||
			!video ||
			!nodePath ||
			!validatedSource ||
			!sequence.controls ||
			previewServerState.type !== 'connected'
		) {
			return;
		}

		const registeredSequence = sequencesRef.current.find(
			(candidate) => candidate.id === sequence.id,
		);
		if (!registeredSequence) {
			return;
		}

		const contentStartInFrames = isMedia
			? getTimelineMediaStartFrame({
					startMediaFrom: sequence.startMediaFrom,
					mediaFrameAtSequenceZero: sequence.mediaFrameAtSequenceZero,
					sequenceFrameOffset,
					playbackRate: runtimeValues.playbackRate,
				})
			: sequenceFrameOffset;
		const parentPlaybackRate = isMedia
			? sequence.sequencePlaybackRate
			: sequence.sequencePlaybackRate / runtimeValues.playbackRate;
		const samplePlaybackRate = isClose(runtimeValues.playbackRate, 1)
			? 2
			: runtimeValues.playbackRate * 1.01;
		const keyframeChanges = getPlaybackRateKeyframeChanges({
			nodePath,
			sequences: sequencesRef.current,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
			propStatuses: propStatusesRef.current,
			previousPlaybackRate: runtimeValues.playbackRate,
			playbackRate: samplePlaybackRate,
		});
		const hasEditableKeyframes =
			keyframeChanges.sequenceKeyframes.length > 0 ||
			keyframeChanges.effectKeyframes.length > 0;
		const {clientId} = previewServerState;
		const {schema} = sequence.controls;
		const {duration: timelineDurationInFrames} = sequence;
		const durationInParentFrames = registeredSequence.duration;

		setSelectedModal({
			type: 'change-speed',
			contentStartInFrames,
			displayName: sequence.displayName,
			fps: video.fps,
			hasEditableKeyframes,
			initialPlaybackRate: runtimeValues.playbackRate,
			mediaDurationInFrames:
				isMedia && mediaMetadata ? mediaMetadata.duration * video.fps : null,
			parentPlaybackRate,
			timelineDurationInFrames,
			onApply: async ({playbackRate, keyframeTiming}) => {
				const durationInFrames = durationInParentFrames * playbackRate;
				const speedChanged = !isClose(playbackRate, runtimeValues.playbackRate);
				const changes: SaveSequencePropChange[] = speedChanged
					? [
							{
								fileName: validatedSource,
								nodePath,
								fieldKey: 'playbackRate',
								value: playbackRate,
								defaultValue: JSON.stringify(1),
								schema,
								sourceEdit:
									keyframeTiming === 'follow-content'
										? ({type: 'playback-rate'} as const)
										: undefined,
							},
							{
								fileName: validatedSource,
								nodePath,
								fieldKey: 'durationInFrames',
								value: durationInFrames,
								defaultValue: null,
								schema,
							},
							...(runtimeValues.trimAfter === null
								? []
								: [
										{
											fileName: validatedSource,
											nodePath,
											fieldKey: 'trimAfter',
											value: runtimeValues.trimBefore + durationInFrames,
											defaultValue: null,
											schema,
										},
									]),
						]
					: [];
				await saveSequenceProps({
					addedKeyframes: null,
					movedKeyframes: null,
					changes,
					setPropStatuses,
					clientId,
					undoLabel: 'Change speed',
					redoLabel: 'Change speed again',
				});
			},
		});
	}, [
		canChangeSpeed,
		isMedia,
		mediaMetadata,
		nodePath,
		overrideIdToNodePathMappings,
		previewServerState,
		propStatusesRef,
		runtimeValues,
		sequence,
		sequenceFrameOffset,
		sequencesRef,
		setPropStatuses,
		setSelectedModal,
		validatedSource,
		video,
	]);

	return supportsSpeedChange
		? {
				type: 'item',
				id: 'change-speed',
				keyHint: null,
				label: 'Change speed...',
				leftItem: null,
				disabled: !canChangeSpeed,
				onClick: onChangeSpeed,
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'change-speed',
			}
		: null;
};
