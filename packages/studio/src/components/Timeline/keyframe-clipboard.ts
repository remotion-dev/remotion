import type {
	KeyframeClipboardData,
	KeyframeClipboardFieldType,
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
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import type {TimelineSelection} from './TimelineSelection';

type KeyframeFieldIdentity =
	| {readonly type: 'sequence'; readonly fieldKey: string}
	| {
			readonly type: 'effect';
			readonly effectIndex: number;
			readonly fieldKey: string;
	  };

type ResolvedKeyframeField = {
	readonly identity: KeyframeFieldIdentity;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fileName: string;
	readonly schema: InteractivitySchema;
	readonly fieldType: KeyframeClipboardFieldType | null;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly keyframeDisplayOffset: number;
};

const getKeyframeClipboardFieldType = ({
	schema,
	fieldKey,
}: {
	readonly schema: InteractivitySchema;
	readonly fieldKey: string;
}): KeyframeClipboardFieldType | null => {
	const field = Internals.getFlatSchemaWithAllKeys(schema)[fieldKey];
	if (!field) {
		return null;
	}

	switch (field.type) {
		case 'number':
		case 'rotation-css':
		case 'rotation-degrees':
		case 'translate':
		case 'transform-origin':
		case 'scale':
		case 'uv-coordinate':
		case 'color':
			return field.type;
		case 'array':
		case 'boolean':
		case 'enum':
		case 'font-family':
		case 'hidden':
		case 'text-content':
			return null;
		default:
			return null;
	}
};

const getKeyframeFieldIdentity = (
	selection: TimelineSelection,
): KeyframeFieldIdentity | null => {
	if (selection.type === 'keyframe') {
		return parseKeyframeFieldFromNodePath(selection.nodePathInfo.auxiliaryKeys);
	}

	if (selection.type === 'sequence-prop') {
		return {type: 'sequence', fieldKey: selection.key};
	}

	if (selection.type === 'sequence-effect-prop') {
		return {
			type: 'effect',
			effectIndex: selection.i,
			fieldKey: selection.key,
		};
	}

	return null;
};

const resolveKeyframeField = ({
	selection,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
}: {
	readonly selection: TimelineSelection;
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
}): ResolvedKeyframeField | null => {
	if (
		selection.type !== 'keyframe' &&
		selection.type !== 'sequence-prop' &&
		selection.type !== 'sequence-effect-prop'
	) {
		return null;
	}

	const identity = getKeyframeFieldIdentity(selection);
	if (identity === null) {
		return null;
	}

	const track = findTrackForNodePathInfo({
		sequences,
		overrideIdsToNodePaths,
		nodePathInfo: selection.nodePathInfo,
	});
	if (!track || track.nodePathInfo === null) {
		return null;
	}

	const nodePath = track.nodePathInfo.sequenceSubscriptionKey;
	if (identity.type === 'sequence') {
		if (!track.sequence.controls) {
			return null;
		}

		const sequencePropStatus = Internals.getPropStatusesCtx(
			propStatuses,
			nodePath,
		)?.[identity.fieldKey];
		if (!sequencePropStatus || sequencePropStatus.status === 'computed') {
			return null;
		}

		const {schema} = track.sequence.controls;
		return {
			identity,
			nodePath,
			fileName: nodePath.absolutePath,
			schema,
			fieldType: getKeyframeClipboardFieldType({
				schema,
				fieldKey: identity.fieldKey,
			}),
			propStatus: sequencePropStatus,
			keyframeDisplayOffset: track.keyframeDisplayOffset,
		};
	}

	const effect = track.sequence.effects[identity.effectIndex];
	const effectStatus = Internals.getEffectPropStatusesCtx({
		propStatuses,
		nodePath,
		effectIndex: identity.effectIndex,
	});
	const effectPropStatus =
		effectStatus.type === 'can-update-effect'
			? effectStatus.props?.[identity.fieldKey]
			: null;
	if (!effect || !effectPropStatus || effectPropStatus.status === 'computed') {
		return null;
	}

	return {
		identity,
		nodePath,
		fileName: nodePath.absolutePath,
		schema: effect.schema,
		fieldType: getKeyframeClipboardFieldType({
			schema: effect.schema,
			fieldKey: identity.fieldKey,
		}),
		propStatus: effectPropStatus,
		keyframeDisplayOffset: track.keyframeDisplayOffset,
	};
};

const areResolvedFieldsEqual = (
	first: ResolvedKeyframeField,
	second: ResolvedKeyframeField,
): boolean => {
	if (
		Internals.makeSequencePropsSubscriptionKey(first.nodePath) !==
		Internals.makeSequencePropsSubscriptionKey(second.nodePath)
	) {
		return false;
	}

	if (first.identity.type !== second.identity.type) {
		return false;
	}

	if (first.identity.fieldKey !== second.identity.fieldKey) {
		return false;
	}

	return (
		first.identity.type === 'sequence' ||
		(second.identity.type === 'effect' &&
			first.identity.effectIndex === second.identity.effectIndex)
	);
};

export const getKeyframeClipboardDataFromSelections = ({
	selections,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
}: {
	readonly selections: readonly Extract<
		TimelineSelection,
		{type: 'keyframe'}
	>[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
}): KeyframeClipboardData | null => {
	const resolvedFields = selections.map((selection) => ({
		selection,
		resolved: resolveKeyframeField({
			selection,
			sequences,
			overrideIdsToNodePaths,
			propStatuses,
		}),
	}));
	const firstResolved = resolvedFields[0]?.resolved;
	if (
		firstResolved === null ||
		firstResolved === undefined ||
		resolvedFields.some(
			({resolved}) =>
				resolved === null || !areResolvedFieldsEqual(firstResolved, resolved),
		)
	) {
		return null;
	}

	const keyframedPropStatus = firstResolved.propStatus;
	if (keyframedPropStatus.status !== 'keyframed') {
		return null;
	}

	const keyframes: {readonly frame: number; readonly value: unknown}[] = [];
	for (const {selection} of resolvedFields) {
		const sourceFrame = selection.frame - firstResolved.keyframeDisplayOffset;
		const keyframe = keyframedPropStatus.keyframes.find(
			(item) => item.frame === sourceFrame,
		);
		if (
			keyframe === undefined ||
			JSON.stringify(keyframe.value) === undefined
		) {
			return null;
		}

		keyframes.push({frame: sourceFrame, value: keyframe.value});
	}

	keyframes.sort((first, second) => first.frame - second.frame);
	const firstFrame = keyframes[0]?.frame;
	if (firstFrame === undefined) {
		return null;
	}

	return {
		type: 'keyframe',
		version: 1,
		remotionClipboard: 'keyframe',
		fieldType: firstResolved.fieldType,
		keyframes: keyframes.map((keyframe) => {
			return {
				frameOffset: keyframe.frame - firstFrame,
				value: keyframe.value,
			};
		}),
	};
};

export type PasteKeyframeTarget =
	| {
			readonly type: 'valid';
			readonly fileName: string;
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly fieldKey: string;
			readonly effectIndex: number | null;
			readonly keyframes: readonly {
				readonly sourceFrame: number;
				readonly value: unknown;
			}[];
			readonly schema: InteractivitySchema;
	  }
	| {
			readonly type: 'none' | 'multiple' | 'uncopyable' | 'incompatible';
	  };

const isKeyframeValueCompatible = ({
	value,
	fieldType,
}: {
	readonly value: unknown;
	readonly fieldType: KeyframeClipboardFieldType | null;
}): boolean => {
	if (fieldType === null) {
		return true;
	}

	if (fieldType === 'number' || fieldType === 'rotation-degrees') {
		return typeof value === 'number' && Number.isFinite(value);
	}

	if (fieldType === 'scale') {
		return (
			(typeof value === 'number' && Number.isFinite(value)) ||
			typeof value === 'string'
		);
	}

	if (fieldType === 'uv-coordinate') {
		return (
			Array.isArray(value) &&
			value.length === 2 &&
			value.every((item) => typeof item === 'number' && Number.isFinite(item))
		);
	}

	return typeof value === 'string';
};

export const getPasteKeyframeTarget = ({
	selectedItems,
	payload,
	timelinePosition,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
}: {
	readonly selectedItems: readonly TimelineSelection[];
	readonly payload: KeyframeClipboardData;
	readonly timelinePosition: number;
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
}): PasteKeyframeTarget => {
	if (selectedItems.length === 0) {
		return {type: 'none'};
	}

	const selection = selectedItems[0];
	if (!selection || getKeyframeFieldIdentity(selection) === null) {
		return {type: 'none'};
	}

	const resolvedFields = selectedItems.map((item) =>
		resolveKeyframeField({
			selection: item,
			sequences,
			overrideIdsToNodePaths,
			propStatuses,
		}),
	);
	const resolved = resolvedFields[0];
	if (resolved === null) {
		return {type: 'uncopyable'};
	}

	if (
		resolvedFields.some(
			(field) => field === null || !areResolvedFieldsEqual(resolved, field),
		)
	) {
		return {type: 'multiple'};
	}

	if (
		resolved.fieldType !== payload.fieldType ||
		payload.keyframes.some(
			(keyframe) =>
				!isKeyframeValueCompatible({
					value: keyframe.value,
					fieldType: payload.fieldType,
				}),
		)
	) {
		return {type: 'incompatible'};
	}

	return {
		type: 'valid',
		fileName: resolved.fileName,
		nodePath: resolved.nodePath,
		fieldKey: resolved.identity.fieldKey,
		effectIndex:
			resolved.identity.type === 'effect'
				? resolved.identity.effectIndex
				: null,
		keyframes: payload.keyframes.map((keyframe) => ({
			sourceFrame:
				timelinePosition -
				resolved.keyframeDisplayOffset +
				keyframe.frameOffset,
			value: keyframe.value,
		})),
		schema: resolved.schema,
	};
};
