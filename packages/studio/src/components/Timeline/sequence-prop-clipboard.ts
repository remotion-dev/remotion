import {
	isKeyframeClipboardFieldType,
	isKeyframeInterpolationFunction,
	type EffectClipboardParam,
	type SequencePropClipboardData,
} from '@remotion/studio-shared';
import {
	Internals,
	type CanUpdateSequencePropStatus,
	type InteractivitySchema,
	type OverrideIdToNodePaths,
	type PropStatuses,
	type SequencePropsSubscriptionKey,
	type TSequence,
} from 'remotion';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {isKeyframeValueCompatible} from './keyframe-clipboard';
import type {TimelineSelection} from './TimelineSelection';

export const propStatusToClipboardParam = (
	prop: CanUpdateSequencePropStatus,
): EffectClipboardParam | null => {
	if (prop.status === 'computed') {
		return null;
	}

	if (prop.status === 'static') {
		if (prop.codeValue === undefined) {
			return null;
		}

		return {type: 'static', value: prop.codeValue};
	}

	if (!isKeyframeInterpolationFunction(prop.interpolationFunction)) {
		return null;
	}

	return {
		type: 'keyframed',
		interpolationFunction: prop.interpolationFunction,
		keyframes: prop.keyframes,
		easing: prop.easing,
		clamping: prop.clamping,
		...(prop.output === undefined || prop.output === 'linear'
			? {}
			: {output: prop.output}),
		...(prop.posterize === undefined ? {} : {posterize: prop.posterize}),
	};
};

export const getSequencePropClipboardDataFromSelection = ({
	selection,
	propStatuses,
	sequences,
	overrideIdsToNodePaths,
}: {
	readonly selection: TimelineSelection;
	readonly propStatuses: PropStatuses;
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
}): SequencePropClipboardData | null => {
	if (selection.type !== 'sequence-prop') {
		return null;
	}

	const track = findTrackForNodePathInfo({
		sequences,
		overrideIdsToNodePaths,
		nodePathInfo: selection.nodePathInfo,
	});
	if (!track?.sequence.controls) {
		return null;
	}

	const field = Internals.getFlatSchemaWithAllKeys(
		track.sequence.controls.schema,
	)[selection.key];
	if (!field || !isKeyframeClipboardFieldType(field.type)) {
		return null;
	}

	const propStatus = Internals.getPropStatusesCtx(
		propStatuses,
		track.nodePathInfo?.sequenceSubscriptionKey ??
			selection.nodePathInfo.sequenceSubscriptionKey,
	)?.[selection.key];
	if (!propStatus) {
		return null;
	}

	const param = propStatusToClipboardParam(propStatus);
	if (param === null) {
		return null;
	}

	return {
		type: 'sequence-prop',
		version: 1,
		remotionClipboard: 'sequence-prop',
		key: selection.key,
		fieldType: field.type,
		param,
	};
};

type PasteSequencePropEditTarget = {
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fieldKey: string;
	readonly defaultValue: string | null;
	readonly schema: InteractivitySchema;
};

export type PasteSequencePropTarget =
	| {
			readonly type: 'valid';
			readonly targets: PasteSequencePropEditTarget[];
	  }
	| {
			readonly type: 'none' | 'prop-mismatch' | 'uncopyable' | 'incompatible';
	  };

const getPasteTargetForSelection = ({
	selection,
	payload,
	propStatuses,
	sequences,
	overrideIdsToNodePaths,
}: {
	readonly selection: TimelineSelection;
	readonly payload: SequencePropClipboardData;
	readonly propStatuses: PropStatuses;
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
}):
	| {type: 'valid'; target: PasteSequencePropEditTarget}
	| Exclude<PasteSequencePropTarget, {type: 'valid'}> => {
	if (selection.type !== 'sequence-prop' && selection.type !== 'sequence') {
		return {type: 'none'};
	}

	const fieldKey =
		selection.type === 'sequence-prop' ? selection.key : payload.key;
	if (fieldKey !== payload.key) {
		return {type: 'prop-mismatch'};
	}

	const track = findTrackForNodePathInfo({
		sequences,
		overrideIdsToNodePaths,
		nodePathInfo: selection.nodePathInfo,
	});
	if (!track?.sequence.controls || !track.nodePathInfo) {
		return {type: 'uncopyable'};
	}

	const {schema} = track.sequence.controls;
	const field = Internals.getFlatSchemaWithAllKeys(schema)[fieldKey];
	if (!field || field.type !== payload.fieldType) {
		return {type: 'incompatible'};
	}

	const nodePath = track.nodePathInfo.sequenceSubscriptionKey;
	const propStatus = Internals.getPropStatusesCtx(propStatuses, nodePath)?.[
		fieldKey
	];
	if (!propStatus || propStatus.status === 'computed') {
		return {type: 'uncopyable'};
	}

	const values =
		payload.param.type === 'static'
			? [payload.param.value]
			: payload.param.keyframes.map((keyframe) => keyframe.value);
	if (
		values.some(
			(value) =>
				!isKeyframeValueCompatible({value, fieldType: payload.fieldType}),
		)
	) {
		return {type: 'incompatible'};
	}

	return {
		type: 'valid',
		target: {
			fileName: nodePath.absolutePath,
			nodePath,
			fieldKey,
			defaultValue:
				field.default === undefined ? null : JSON.stringify(field.default),
			schema,
		},
	};
};

export const getPasteSequencePropTarget = ({
	selectedItems,
	payload,
	propStatuses,
	sequences,
	overrideIdsToNodePaths,
}: {
	readonly selectedItems: readonly TimelineSelection[];
	readonly payload: SequencePropClipboardData;
	readonly propStatuses: PropStatuses;
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
}): PasteSequencePropTarget => {
	if (selectedItems.length === 0) {
		return {type: 'none'};
	}

	const targets: PasteSequencePropEditTarget[] = [];
	for (const selection of selectedItems) {
		const result = getPasteTargetForSelection({
			selection,
			payload,
			propStatuses,
			sequences,
			overrideIdsToNodePaths,
		});
		if (result.type !== 'valid') {
			return result;
		}

		targets.push(result.target);
	}

	return {
		type: 'valid',
		targets: [
			...new Map(
				targets.map((target) => [
					Internals.makeSequencePropsSubscriptionKey(target.nodePath),
					target,
				]),
			).values(),
		],
	};
};
