import React, {useMemo} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import styled from 'styled-components';
import {SequenceWithOverlap} from '../helpers/calculate-timeline';
import {useWindowSize} from '../hooks/use-window-size';

const Pre = styled.pre`
	color: white;
	font-family: Arial, Helvetica, sans-serif;
	font-size: 12px;
	margin-top: 0;
	margin-bottom: 0;
	padding: 5px;
`;

export const TimelineSequence: React.FC<{
	s: SequenceWithOverlap;
}> = ({s}) => {
	const {width} = useWindowSize();

	// If a duration is 1, it is essentially a still and it should have width 0
	const spatialDuration = Internals.FEATURE_FLAG_V2_BREAKING_CHANGES
		? s.sequence.duration - 1
		: s.sequence.duration;
	const videoConfig = useVideoConfig();

	if (!videoConfig) {
		throw new TypeError('Expected video config');
	}

	const lastFrame = (videoConfig.durationInFrames ?? 1) - 1;

	const style: React.CSSProperties = useMemo(() => {
		return {
			background: 'linear-gradient(to bottom, #3697e1, #348AC7 60%)',
			border: '1px solid rgba(255, 255, 255, 0.2)',
			borderRadius: 4,
			position: 'absolute',
			height: 80,
			marginTop: 1,
			marginLeft: `calc(${(s.sequence.from / lastFrame) * 100}%)`,
			width:
				s.sequence.duration === Infinity
					? width
					: `calc(${(spatialDuration / lastFrame) * 100}%)`,
			color: 'white',
			overflow: 'hidden',
		};
	}, [lastFrame, s.sequence.duration, s.sequence.from, spatialDuration, width]);

	return (
		<div key={s.sequence.id} style={style} title={s.sequence.displayName}>
			<Pre>{s.sequence.displayName}</Pre>
		</div>
	);
};
