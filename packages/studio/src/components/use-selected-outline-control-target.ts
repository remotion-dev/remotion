import {useCanvasSequenceHover} from '@remotion/canvas';
import React, {useContext, useLayoutEffect, useRef} from 'react';
import {TimelineSequenceHoverContext} from '../state/timeline-sequence-hover';
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
	const hoverController = useContext(TimelineSequenceHoverContext);
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
	const {hovered, onPointerEnter, onPointerLeave} = useCanvasSequenceHover(
		hoverController,
		layoutTarget?.nodePathInfo ?? null,
		'canvas',
	);
	const controlTarget =
		layoutTarget !== undefined && (layoutTarget.containsSelection || hovered)
			? getLatestTargetByKey(layoutTarget.key)
			: undefined;
	const onHoverChange = React.useCallback(
		(key: string | null) => {
			if (key === null) {
				onPointerLeave();
			} else if (targetRef.current?.key === key) {
				onPointerEnter();
			}
		},
		[onPointerEnter, onPointerLeave],
	);

	return {controlTarget, getLayoutTarget, getTarget, hovered, onHoverChange};
};
