import type {CanUpdateSequencePropStatus, TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {isSequenceSplitPending} from './pending-sequence-splits';
import {
	getSequenceSourceSplitFrame,
	getTimelineSequenceSplitEligibility,
	splitTimelineSequenceFromSource,
} from './split-selected-timeline-item';

export const getSequenceSplitMenuItem = ({
	nodePathInfo,
	sequence,
	propStatuses,
	splitFrame,
	keyframeDisplayOffset,
	keyframePlaybackRate,
	canEditSource,
	hasMultipleSelection,
}: {
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequence: TSequence;
	readonly propStatuses:
		| Record<string, CanUpdateSequencePropStatus>
		| undefined;
	readonly splitFrame: number;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
	readonly canEditSource: boolean;
	readonly hasMultipleSelection: boolean;
}): ComboboxValue | null => {
	if (hasMultipleSelection) {
		return null;
	}

	const eligibility = nodePathInfo
		? getTimelineSequenceSplitEligibility({
				selection: {type: 'sequence', nodePathInfo},
				sequence,
				propStatuses,
				splitFrame,
			})
		: {
				canSplit: false as const,
				reason: 'Sequence has no editable source node',
			};
	const isSplitting =
		nodePathInfo !== null && isSequenceSplitPending(nodePathInfo);
	const disabledReason = isSplitting
		? 'Splitting…'
		: !canEditSource
			? 'Sequence source is unavailable'
			: propStatuses === undefined
				? 'Waiting for sequence prop status'
				: eligibility.canSplit
					? null
					: eligibility.reason;

	return {
		type: 'item',
		id: 'split-sequence',
		label: (
			<span
				role="group"
				style={{
					fontFamily: 'inherit',
					fontSize: 'inherit',
					lineHeight: 'inherit',
					color: 'inherit',
				}}
				aria-label={disabledReason ?? 'Split at the playhead'}
			>
				{isSplitting ? 'Splitting…' : 'Split'}
			</span>
		),
		value: 'split-sequence',
		keyHint: null,
		leftItem: null,
		quickSwitcherLabel: null,
		subMenu: null,
		disabled: disabledReason !== null,
		onClick: () => {
			if (
				disabledReason !== null ||
				!eligibility.canSplit ||
				isSequenceSplitPending(eligibility.nodePathInfo)
			) {
				return;
			}

			// Keep the frame used to enable the menu item, even during playback.
			splitTimelineSequenceFromSource({
				nodePathInfo: eligibility.nodePathInfo,
				expectedDuration: splitFrame - sequence.from,
				splitFrame: getSequenceSourceSplitFrame({
					timelineFrame: splitFrame,
					keyframeDisplayOffset,
					keyframePlaybackRate,
				}),
			}).catch(() => undefined);
		},
	};
};
