import {NoReactInternals} from 'remotion/no-react';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {formatContextForAgents} from '../../helpers/format-file-location';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {resolveSourceLocation} from '../../helpers/open-in-editor';
import {projectEffectSequence} from '../../helpers/optimistic-effect-projection';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {isDuplicatableEffectSelection} from './duplicate-selected-timeline-item';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {getCopyContextForAgentsMenuItem} from './get-copy-context-for-agents-menu-item';
import type {TimelineSelection} from './TimelineSelection';
import {getOriginalLocationFromStack} from './TimelineStack/get-stack';

type EffectSelection = TimelineSelection & {type: 'sequence-effect'};

export const getMultiSelectedEffects = (
	selectedItems: readonly TimelineSelection[],
): readonly EffectSelection[] | null => {
	const effects = selectedItems.filter(isDuplicatableEffectSelection);
	return effects.length < 2 || effects.length !== selectedItems.length
		? null
		: effects;
};

// The sequence location is shared by all of its effects, so point at the effect itself.
export const getEffectContextForAgents = async ({
	label,
	sequenceLocation,
	effectIndex,
}: {
	readonly label: string;
	readonly sequenceLocation: CodePosition;
	readonly effectIndex: number;
}): Promise<string | null> => {
	const location = await resolveSourceLocation({
		originalPosition: sequenceLocation,
		property: null,
		effectIndex,
	}).catch(() => sequenceLocation);

	return formatContextForAgents({
		location,
		name: `Effect "${label}"`,
		root: window.remotion_cwd,
	});
};

export const getEffectsContextForAgents = async ({
	effects,
	tracks,
}: {
	readonly effects: readonly EffectSelection[];
	readonly tracks: readonly TimelineTrackData[];
}): Promise<string | null> => {
	const contexts = await Promise.all(
		effects.map(async ({nodePathInfo, i}) => {
			const track = findTrackForNodePathInfo({tracks, nodePathInfo});
			if (!track) {
				return null;
			}

			const sequence = projectEffectSequence(
				track.sequence,
				nodePathInfo.sequenceSubscriptionKey,
				null,
			);
			const effect = sequence.effects[i];
			const stack = sequence.getStack();
			if (!effect || !stack) {
				return null;
			}

			const location = await getOriginalLocationFromStack(
				stack,
				'sequence',
			).catch(() => null);
			if (!location?.source || !location.line) {
				return null;
			}

			return getEffectContextForAgents({
				label: effect.label,
				sequenceLocation: {
					source: location.source,
					line: location.line,
					column: location.column ?? 0,
				},
				effectIndex: i,
			});
		}),
	);
	const uniqueContexts = [...new Set(contexts.filter(NoReactInternals.truthy))];

	return uniqueContexts.length === 0 ? null : uniqueContexts.join('\n');
};

export const getMultiEffectContextMenuItems = ({
	selectedEffectCount,
	getContextForAgents,
	disabled,
	onDuplicateSelectedEffects,
	onDeleteSelectedEffects,
}: {
	readonly selectedEffectCount: number;
	readonly getContextForAgents: () => Promise<string | null>;
	readonly disabled: boolean;
	readonly onDuplicateSelectedEffects: () => void;
	readonly onDeleteSelectedEffects: () => void;
}): ComboboxValue[] => {
	return [
		getCopyContextForAgentsMenuItem({contextForAgents: getContextForAgents}),
		{
			type: 'divider',
			id: 'copy-context-for-agents-divider',
		},
		{
			type: 'item',
			id: 'duplicate-selected-effects',
			keyHint: null,
			label: 'Duplicate selected',
			leftItem: null,
			disabled,
			onClick: onDuplicateSelectedEffects,
			quickSwitcherLabel: null,
			subMenu: null,
			value: 'duplicate-selected-effects',
		},
		{
			type: 'divider',
			id: 'duplicate-delete-selected-effects-divider',
		},
		{
			type: 'item',
			id: 'delete-selected-effects',
			keyHint: null,
			label: `Delete ${selectedEffectCount} effects`,
			leftItem: null,
			disabled,
			onClick: onDeleteSelectedEffects,
			quickSwitcherLabel: null,
			subMenu: null,
			value: 'delete-selected-effects',
		},
	];
};
