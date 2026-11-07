import {useCallback, useContext} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {getPlaybackRateKeyframeChanges} from './get-playback-rate-keyframe-changes';
import {useSequencePropPreview} from './use-sequence-prop-preview';

export const usePlaybackRatePreview = ({
	field,
	nodePath,
}: {
	readonly field: SchemaFieldInfo;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	const {
		getPreview: getRetimingPreview,
		takePreview: takeRetimingPreview,
		cancelPreview,
	} = useSequencePropPreview();
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
	);
	const getPlaybackRateChanges = useCallback(
		(value: unknown) => {
			if (
				field.key !== 'playbackRate' ||
				nodePath === null ||
				typeof value !== 'number'
			) {
				return null;
			}

			const currentStatus = Internals.getPropStatusesCtx(
				propStatusesRef.current,
				nodePath,
			)?.playbackRate;
			const previousPlaybackRate =
				currentStatus?.status === 'static' &&
				typeof currentStatus.codeValue === 'number'
					? currentStatus.codeValue
					: field.fieldSchema.default;
			if (typeof previousPlaybackRate !== 'number') {
				return null;
			}

			return getPlaybackRateKeyframeChanges({
				nodePath,
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
				propStatuses: propStatusesRef.current,
				previousPlaybackRate,
				playbackRate: value,
			});
		},
		[
			field.fieldSchema.default,
			field.key,
			nodePath,
			overrideIdToNodePathMappingsRef,
			propStatusesRef,
			sequencesRef,
		],
	);
	const {updateDragOverridesBatch, updateEffectDragOverridesBatch} = useContext(
		Internals.VisualModeSettersContext,
	);
	const applyRetimingPreview = useCallback(
		(
			preview: ReturnType<typeof getRetimingPreview>,
			keyframes: ReturnType<typeof getPlaybackRateKeyframeChanges>['previews'],
		) => {
			preview.setDragOverridesBatch(
				keyframes.flatMap((item) =>
					item.effectIndex === null
						? [
								{
									nodePath: item.nodePath,
									key: item.fieldKey,
									value: {type: 'keyframed' as const, status: item.status},
								},
							]
						: [],
				),
				updateDragOverridesBatch,
			);
			preview.setEffectDragOverridesBatch(
				keyframes.flatMap((item) =>
					item.effectIndex === null
						? []
						: [
								{
									nodePath: item.nodePath,
									effectIndex: item.effectIndex,
									key: item.fieldKey,
									value: {type: 'keyframed' as const, status: item.status},
								},
							],
				),
				updateEffectDragOverridesBatch,
			);
		},
		[updateDragOverridesBatch, updateEffectDragOverridesBatch],
	);
	const previewValue = useCallback(
		(value: unknown) => {
			const keyframes = getPlaybackRateChanges(value)?.previews ?? [];
			cancelPreview();
			applyRetimingPreview(getRetimingPreview(), keyframes);
		},
		[
			getPlaybackRateChanges,
			cancelPreview,
			applyRetimingPreview,
			getRetimingPreview,
		],
	);
	const take = useCallback(
		(value: unknown) => {
			const keyframePreviews = getPlaybackRateChanges(value)?.previews ?? [];
			const retimingPreview = takeRetimingPreview();
			applyRetimingPreview(retimingPreview, keyframePreviews);
			const retimedNodes = new Map<
				string,
				{
					nodePath: SequencePropsSubscriptionKey;
					keyframes: typeof keyframePreviews;
				}
			>();
			for (const keyframe of keyframePreviews) {
				const currentPath = retimingPreview.getNodePath(keyframe.nodePath);
				if (currentPath === null) {
					retimingPreview.cancel();
					return null;
				}

				const key = Internals.makeSequencePropsSubscriptionKey(currentPath);
				const node = retimedNodes.get(key) ?? {
					nodePath: currentPath,
					keyframes: [],
				};
				node.keyframes.push(keyframe);
				retimedNodes.set(key, node);
			}

			return {
				preview: retimingPreview,
				commit: () => {
					retimingPreview.setPropStatusesBatch(
						[...retimedNodes.values()].map(({nodePath: path, keyframes}) => ({
							nodePath: path,
							update: (previous) => {
								if (!previous.canUpdate) return previous;
								let {props} = previous;
								let {effects} = previous;
								for (const keyframe of keyframes) {
									if (keyframe.effectIndex === null) {
										if (props === previous.props) props = {...props};
										props[keyframe.fieldKey] = keyframe.status;
									} else {
										const effect = effects[keyframe.effectIndex];
										if (!effect?.canUpdate) continue;
										if (effects === previous.effects) effects = [...effects];
										effects[keyframe.effectIndex] = {
											...effect,
											props: {
												...effect.props,
												[keyframe.fieldKey]: keyframe.status,
											},
										};
									}
								}

								return props === previous.props && effects === previous.effects
									? previous
									: {...previous, props, effects};
							},
						})),
					);
				},
			};
		},
		[getPlaybackRateChanges, takeRetimingPreview, applyRetimingPreview],
	);
	return {preview: previewValue, take, cancel: cancelPreview};
};
