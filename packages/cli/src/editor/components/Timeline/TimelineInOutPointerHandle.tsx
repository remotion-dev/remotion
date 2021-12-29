import React, {createRef, useMemo} from 'react';
import {useGetXPositionOfItemInTimeline} from '../../helpers/get-left-of-timeline-slider';

const line: React.CSSProperties = {
	height: '100%',
	width: 1,
	position: 'absolute',
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	cursor: 'ew-resize',
	paddingLeft: 1,
	paddingRight: 1,
};

export const inPointerHandle = createRef<HTMLDivElement>();
export const outPointerHandle = createRef<HTMLDivElement>();

export const TimelineInOutPointerHandle: React.FC<{
	dragging: boolean;
	type: 'in' | 'out';
	atFrame: number;
}> = ({dragging, type, atFrame}) => {
	const {get} = useGetXPositionOfItemInTimeline();
	const style: React.CSSProperties = useMemo(() => {
		return {
			...line,
			backgroundColor: dragging
				? 'rgba(255, 255, 255, 0.7)'
				: 'rgba(255, 255, 255, 0.1)',
			transform: `translateX(${get(atFrame)}px)`,
		};
	}, [atFrame, dragging, get]);

	return (
		<div
			ref={type === 'in' ? inPointerHandle : outPointerHandle}
			style={style}
		/>
	);
};
