import React, {useMemo} from 'react';
import {Internals, TSequence} from 'remotion';
import styled from 'styled-components';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';
import {useWindowSize} from '../hooks/use-window-size';
import {AudioWaveform} from './AudioWaveform';
import {Thumbnail} from './Thumbnail';

const Pre = styled.pre`
	color: white;
	font-family: Arial, Helvetica, sans-serif;
	font-size: 12px;
	margin-top: 0;
	margin-bottom: 0;
	padding: 5px;
	position: absolute;
`;

export const TIMELINE_LAYER_HEIGHT = 80;

export const TimelineSequence: React.FC<{
	s: TSequence;
}> = ({s}) => {
	const {width} = useWindowSize();

	// If a duration is 1, it is essentially a still and it should have width 0
	const spatialDuration = Internals.FEATURE_FLAG_V2_BREAKING_CHANGES
		? s.duration - 1
		: s.duration;
	const video = Internals.useVideo();

	if (!video) {
		throw new TypeError('Expected video config');
	}

	const lastFrame = (video.durationInFrames ?? 1) - 1;

	const style: React.CSSProperties = useMemo(() => {
		return {
			background: 'linear-gradient(to bottom, #3697e1, #348AC7 60%)',
			border: '1px solid rgba(255, 255, 255, 0.2)',
			borderRadius: 4,
			position: 'absolute',
			height: TIMELINE_LAYER_HEIGHT,
			marginTop: 1,
			marginLeft: `calc(${(s.from / lastFrame) * 100}%)`,
			width:
				s.duration === Infinity
					? width - TIMELINE_PADDING * 2
					: (spatialDuration / lastFrame) * width - TIMELINE_PADDING * 2,
			color: 'white',
			overflow: 'hidden',
		};
	}, [lastFrame, s.duration, s.from, spatialDuration, width]);

	const row: React.CSSProperties = useMemo(() => {
		return {
			flexDirection: 'row',
			display: 'flex',
			borderRadius: 5,
			overflow: 'hidden',
		};
	}, []);

	const thumbnailWidth = TIMELINE_LAYER_HEIGHT * (video.width / video.height);

	const thumbnailFit = Math.ceil(width / thumbnailWidth);

	return (
		<div key={s.id} style={style} title={s.displayName}>
			<div style={row}>
				{Internals.FEATURE_FLAG_RICH_PREVIEWS
					? new Array(thumbnailFit).fill(true).map((_, i) => {
							const frameToDisplay = Math.floor(
								(i / thumbnailFit) * video.durationInFrames
							);
							return (
								<Thumbnail
									key={frameToDisplay}
									targetHeight={TIMELINE_LAYER_HEIGHT}
									targetWidth={thumbnailWidth}
									composition={video}
									frameToDisplay={frameToDisplay}
								/>
							);
					  })
					: null}
			</div>
			{s.type === 'audio' ? <AudioWaveform src={s.src} /> : null}
			<Pre>{s.displayName}</Pre>
		</div>
	);
};
