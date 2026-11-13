import {
	type AddKeyframesRequest,
	optimisticAddEffectKeyframe,
	optimisticAddSequenceKeyframe,
	optimisticDeleteEffectKeyframes,
	optimisticDeleteSequenceKeyframes,
	optimisticUpdateEffectKeyframeSettings,
	optimisticUpdateSequenceKeyframeSettings,
} from '@remotion/studio-shared';
import type {ContextType} from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import {Internals, type CanUpdateSequencePropsResponse} from 'remotion';
import {
	attachOptimisticEffectPropHistory,
	createOptimisticEffectPropUpdate,
} from '../../helpers/optimistic-effect-props';
import {acceptSequencePropsSourceVersion} from '../../helpers/sequence-props-source-version';
import {createCanvasDragPreview} from '../canvas-drag-preview';
import type {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {addKeyframes} from './call-add-keyframe';
import {
	getKeyframeDisplayOffset,
	getKeyframeSourceFrame,
} from './get-timeline-keyframes';
import type {PasteKeyframeTarget} from './keyframe-clipboard';

export const callPasteKeyframes = ({
	target,
	setters,
	getSnapshot,
	sequences,
	overrideIdsToNodePaths,
	clientId,
}: {
	target: Extract<PasteKeyframeTarget, {type: 'valid'}>;
	setters: ContextType<typeof Internals.VisualModeSettersContext>;
	getSnapshot: ContextType<
		typeof Internals.VisualModePropStatusesSubscriptionContext
	>['getSnapshot'];
	sequences: ContextType<typeof Internals.SequenceManagerRefContext>['current'];
	overrideIdsToNodePaths: ContextType<
		typeof OverrideIdToNodePathMappingsRefContext
	>['current'];
	clientId: string;
}): Promise<void> => {
	const {nodePath, fieldKey, effectIndex, schema} = target;
	const getStatus = (previous: CanUpdateSequencePropsResponse) => {
		if (!previous?.canUpdate) return null;
		const effect =
			effectIndex === null
				? null
				: previous.effects.find((item) => item.effectIndex === effectIndex);
		const source =
			effectIndex === null
				? previous.props[fieldKey]
				: effect?.canUpdate
					? effect.props[fieldKey]
					: null;

		return source
			? Internals.evaluateSourcePropStatuses(
					{value: source},
					nodePath.videoConfigValues,
				).value
			: null;
	};

	const applyOptimistic = (previous: CanUpdateSequencePropsResponse) => {
		const status = getStatus(previous);
		const frames = target.keyframes.map((keyframe) =>
			getKeyframeSourceFrame({
				displayFrame: keyframe.displayFrame,
				keyframeDisplayOffset: getKeyframeDisplayOffset({
					propStatus: status,
					keyframeDisplayOffset: target.keyframeDisplayOffset,
					keyframePlaybackRate: target.keyframePlaybackRate,
				}),
				keyframePlaybackRate: target.keyframePlaybackRate,
				propStatus: status,
			}),
		);
		let next = target.keyframes.reduce((current, keyframe, index) => {
			const change = {
				previous: current,
				videoConfigValues: nodePath.videoConfigValues,
				fieldKey,
				frame: frames[index],
				value: keyframe.value,
				schema,
			};
			return effectIndex === null
				? optimisticAddSequenceKeyframe(change)
				: optimisticAddEffectKeyframe({...change, effectIndex});
		}, previous);
		const added = getStatus(next);
		const firstFrame = Math.min(...frames);
		const lastFrame = Math.max(...frames);
		const obsolete =
			added?.status === 'keyframed'
				? added.keyframes.filter(
						(keyframe) =>
							keyframe.frame >= firstFrame &&
							keyframe.frame <= lastFrame &&
							!frames.includes(keyframe.frame),
					)
				: [];
		const deletions = obsolete.map(({frame}) => ({
			fieldKey,
			frame,
			valueWhenLastKeyframeDeleted: null,
		}));
		next =
			effectIndex === null
				? optimisticDeleteSequenceKeyframes({
						previous: next,
						videoConfigValues: nodePath.videoConfigValues,
						keyframes: deletions,
					})
				: optimisticDeleteEffectKeyframes({
						previous: next,
						videoConfigValues: nodePath.videoConfigValues,
						keyframes: deletions.map((item) => ({...item, effectIndex})),
					});
		const replaced = getStatus(next);
		if (replaced?.status !== 'keyframed') return next;
		const firstIndex = replaced.keyframes.findIndex(
			(keyframe) => keyframe.frame === frames[0],
		);
		for (const [index, easing] of target.easing.entries()) {
			const change = {
				previous: next,
				fieldKey,
				settings: {
					type: 'easing' as const,
					segmentIndex: firstIndex + index,
					easing,
				},
			};
			next =
				effectIndex === null
					? optimisticUpdateSequenceKeyframeSettings(change)
					: optimisticUpdateEffectKeyframeSettings({...change, effectIndex});
		}

		return next;
	};

	const timingGuards: Array<
		NonNullable<
			NonNullable<AddKeyframesRequest['paste']>['timingGuards']
		>[number]
	> = [];
	const sequencesById = new Map(
		sequences.map((sequence) => [sequence.id, sequence]),
	);
	let ancestorId = sequencesById.get(target.sequenceId)?.parent ?? null;
	while (ancestorId !== null) {
		const ancestor = sequencesById.get(ancestorId);
		if (!ancestor) break;
		ancestorId = ancestor.parent;
		const ancestorPath = ancestor.controls
			? overrideIdsToNodePaths[ancestor.controls.overrideId]
			: null;
		if (!ancestorPath || !ancestor.controls) continue;
		const flatSchema = Internals.getFlatSchemaWithAllKeys(
			ancestor.controls.schema,
		);
		const isSeriesSequence =
			ancestor.controls.componentIdentity ===
			'dev.remotion.remotion.Series.Sequence';
		const fields = (['from', 'trimBefore', 'playbackRate'] as const).flatMap(
			(key) => {
				const field = flatSchema[key];
				const isDerivedFrom = key === 'from' && isSeriesSequence;
				if (!field && !isDerivedFrom) return [];
				return [
					{
						key,
						value:
							key === 'from'
								? ancestor.from
								: key === 'trimBefore'
									? (ancestor.trimBefore ?? 0)
									: ancestor.sequencePlaybackRate,
						defaultValue:
							!isDerivedFrom &&
							field &&
							'default' in field &&
							typeof field.default === 'number'
								? field.default
								: null,
					},
				];
			},
		);
		if (fields.length === 0) continue;
		timingGuards.push({
			fileName: ancestorPath.absolutePath,
			nodePath: {
				...ancestorPath,
				videoConfigValues: ancestor.controls.videoConfigValues,
			},
			fields,
		});
	}

	const effectUpdate =
		effectIndex === null
			? null
			: createOptimisticEffectPropUpdate({
					nodePath,
					effectIndex,
					fieldKey,
					schema,
					applyOptimistic,
				});
	const preview = createCanvasDragPreview({
		updateDragOverrides: setters.updateDragOverrides,
		setPropStatuses: setters.setPropStatuses,
		setPropStatusesBatch: setters.setPropStatusesBatch,
		getPropStatuses: (path) =>
			getSnapshot(Internals.makeSequencePropsSubscriptionKey(path)) ??
			undefined,
	});
	unstable_batchedUpdates(() => {
		if (effectUpdate?.optimistic) {
			setters.setPropStatuses(nodePath, effectUpdate.applyOptimistic);
			return;
		}

		const previous = getSnapshot(
			Internals.makeSequencePropsSubscriptionKey(nodePath),
		);
		if (!previous) return;
		const status = getStatus(applyOptimistic(previous));
		if (status?.status !== 'keyframed') return;
		const value = {type: 'keyframed' as const, status};
		if (effectIndex === null)
			preview.setDragOverridesBatch(
				[{nodePath, key: fieldKey, value}],
				setters.updateDragOverridesBatch,
			);
		else
			preview.setEffectDragOverridesBatch(
				[{nodePath, effectIndex, key: fieldKey, value}],
				setters.updateEffectDragOverridesBatch,
			);
		preview.setPropStatuses(nodePath, applyOptimistic);
	});
	const points = target.keyframes.map((keyframe) => ({
		fileName: target.fileName,
		key: fieldKey,
		frame: keyframe.displayFrame,
		value: JSON.stringify(keyframe.value),
		schema,
	}));
	return addKeyframes(
		attachOptimisticEffectPropHistory(
			{
				sequenceKeyframes:
					effectIndex === null
						? points.map((point) => ({...point, nodePath}))
						: [],
				effectKeyframes:
					effectIndex === null
						? []
						: points.map((point) => ({
								...point,
								sequenceNodePath: nodePath,
								effectIndex,
							})),
				paste: {
					keyframeDisplayOffset: target.keyframeDisplayOffset,
					keyframePlaybackRate: target.keyframePlaybackRate,
					easing: [...target.easing],
					timingGuards,
				},
				clientId,
			},
			effectUpdate ? [effectUpdate] : [],
		),
	)
		.then((response) => {
			if (effectUpdate?.optimistic) {
				const result = response.results.find(
					(item) => item.effectIndex !== null,
				);
				if (
					result &&
					acceptSequencePropsSourceVersion(
						setters.updateDragOverrides,
						result.nodePath,
						result.sourceVersion,
					)
				) {
					effectUpdate.applyKeyframeResponse(
						Internals.evaluateSourcePropStatuses(
							result.props,
							result.nodePath.videoConfigValues,
						),
					);
				}
			}

			effectUpdate?.acknowledge();
			preview.acknowledgeKeyframes(response.results);
		})
		.catch((error) => {
			effectUpdate?.rollback();
			preview.fail();
			throw error;
		});
};
