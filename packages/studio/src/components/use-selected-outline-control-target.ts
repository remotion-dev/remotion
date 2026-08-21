import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {timelineSequenceNodePathToKey} from '../helpers/timeline-node-path-key';
import {
	useIsTimelineSequenceHovered,
	useSetTimelineSequenceHover,
} from '../state/timeline-sequence-hover';
import type {
	SelectedOutlineLayoutTarget,
	SelectedOutlineTarget,
} from './selected-outline-types';

export const useSelectedOutlineControlTarget = ({
	getLatestTargetByKey,
	layoutTarget,
}: {
	readonly getLatestTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly layoutTarget: SelectedOutlineLayoutTarget | undefined;
}) => {
	const setHoveredSequence = useSetTimelineSequenceHover();
	const targetRef = useRef(layoutTarget);
	useLayoutEffect(() => {
		targetRef.current = layoutTarget;
	}, [layoutTarget]);
	const getTarget = React.useCallback(() => {
		const currentTarget = targetRef.current;
		if (currentTarget === undefined) {
			return undefined;
		}

		return getLatestTargetByKey(currentTarget.key);
	}, [getLatestTargetByKey]);
	const getLayoutTarget = React.useCallback(() => targetRef.current, []);
	const hoveredNodePathKey = useMemo(
		() =>
			layoutTarget === undefined
				? null
				: timelineSequenceNodePathToKey(
						layoutTarget.nodePathInfo.sequenceSubscriptionKey,
					),
		[layoutTarget],
	);
	const hovered = useIsTimelineSequenceHovered(hoveredNodePathKey);
	const controlTarget =
		layoutTarget !== undefined && (layoutTarget.containsSelection || hovered)
			? getLatestTargetByKey(layoutTarget.key)
			: undefined;
	const onHoverChange = React.useCallback(
		(key: string | null) => {
			setHoveredSequence((currentHover) => {
				if (key !== null) {
					const hoverTarget = targetRef.current;
					if (hoverTarget === undefined || hoverTarget.key !== key) {
						return currentHover;
					}

					return {
						key,
						nodePathKey: timelineSequenceNodePathToKey(
							hoverTarget.nodePathInfo.sequenceSubscriptionKey,
						),
						source: 'canvas',
					};
				}

				return currentHover?.source === 'canvas' ? null : currentHover;
			});
		},
		[setHoveredSequence],
	);

	return {controlTarget, getLayoutTarget, getTarget, hovered, onHoverChange};
};
