import React, {useMemo} from 'react';
import {Internals, TSequence} from 'remotion';
import styled from 'styled-components';
import {
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {useWindowSize} from '../../hooks/use-window-size';
import {AudioWaveform} from '../AudioWaveform';
import {Thumbnail} from '../Thumbnail';

const Pre = styled.pre`
	color: white;
	font-family: Arial, Helvetica, sans-serif;
	font-size: 12px;
	margin-top: 0;
	margin-bottom: 0;
	padding: 5px;
	position: absolute;
`;

const SEQUENCE_GRADIENT = 'linear-gradient(to bottom, #3697e1, #348AC7 60%)';
const AUDIO_GRADIENT = 'linear-gradient(rgb(16 171 58), rgb(43 165 63) 60%)';

export const TimelineSequence: React.FC<{
	s: TSequence;
	fps: number;
}> = ({s, fps}) => {
	const {width: windowWidth} = useWindowSize();

	// If a duration is 1, it is essentially a still and it should have width 0
	const spatialDuration = Internals.FEATURE_FLAG_V2_BREAKING_CHANGES
		? s.duration - 1
		: s.duration;
	const video = Internals.useVideo();

	if (!video) {
		throw new TypeError('Expected video config');
	}

	const lastFrame = (video.durationInFrames ?? 1) - 1;

	const width =
		s.duration === Infinity
			? windowWidth - TIMELINE_PADDING * 2
			: (spatialDuration / lastFrame) * windowWidth - TIMELINE_PADDING * 2;

	const style: React.CSSProperties = useMemo(() => {
		return {
			background: s.type === 'audio' ? AUDIO_GRADIENT : SEQUENCE_GRADIENT,
			border: '1px solid rgba(255, 255, 255, 0.2)',
			borderRadius: 4,
			position: 'absolute',
			height: TIMELINE_LAYER_HEIGHT,
			marginTop: 1,
			marginLeft: `calc(${(s.from / lastFrame) * 100}%)`,
			width,
			color: 'white',
			overflow: 'hidden',
		};
	}, [lastFrame, s.from, s.type, width]);

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
			{s.type === 'audio' ? (
				<AudioWaveform
					src={s.src}
					visualizationWidth={width}
					startFrom={s.from}
					duration={s.duration}
					fps={fps}
				/>
			) : null}
			<Pre>{s.displayName}</Pre>
		</div>
	);
};
