import React, {useContext, useMemo, useState} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {BLUE} from '../../helpers/colors';
import {
	getTimelineSequenceLayout,
	SEQUENCE_BORDER_WIDTH,
} from '../../helpers/get-timeline-sequence-layout';
import {TIMELINE_LAYER_HEIGHT} from '../../helpers/timeline-layout';
import {AudioWaveform} from '../AudioWaveform';
import {LoopedTimelineIndicator} from './LoopedTimelineIndicators';
import {TimelineVideoInfo} from './TimelineVideoInfo';
import {TimelineWidthContext} from './TimelineWidthProvider';

const AUDIO_GRADIENT = 'linear-gradient(rgb(16 171 58), rgb(43 165 63) 60%)';
const VIDEO_GRADIENT = 'linear-gradient(to top, #8e44ad, #9b59b6)';

export const TimelineSequence: React.FC<{
	s: TSequence;
}> = ({s}) => {
	const windowWidth = useContext(TimelineWidthContext);

	if (windowWidth === null) {
		return null;
	}

	return <Inner windowWidth={windowWidth} s={s} />;
};

const Inner: React.FC<{
	s: TSequence;
	windowWidth: number;
}> = ({s, windowWidth}) => {
	// If a duration is 1, it is essentially a still and it should have width 0
	// Some compositions may not be longer than their media duration,
	// if that is the case, it needs to be asynchronously determined
	const [maxMediaDuration, setMaxMediaDuration] = useState(Infinity);

	const video = Internals.useVideo();

	if (!video) {
		throw new TypeError('Expected video config');
	}

	const {marginLeft, width} = useMemo(() => {
		return getTimelineSequenceLayout({
			durationInFrames: s.loopDisplay
				? s.loopDisplay.durationInFrames * s.loopDisplay.numberOfTimes
				: s.duration,
			startFrom: s.loopDisplay ? s.from + s.loopDisplay.startOffset : s.from,
			startFromMedia: s.type === 'sequence' ? 0 : s.startMediaFrom,
			maxMediaDuration,
			video,
			windowWidth,
		});
	}, [maxMediaDuration, s, video, windowWidth]);

	const style: React.CSSProperties = useMemo(() => {
		return {
			background:
				s.type === 'audio'
					? AUDIO_GRADIENT
					: s.type === 'video'
					? VIDEO_GRADIENT
					: BLUE,
			border: SEQUENCE_BORDER_WIDTH + 'px solid rgba(255, 255, 255, 0.2)',
			borderRadius: 4,
			position: 'absolute',
			height: TIMELINE_LAYER_HEIGHT,
			marginTop: 1,
			marginLeft,
			width,
			color: 'white',
			overflow: 'hidden',
		};
	}, [marginLeft, s.type, width]);

	return (
		<div key={s.id} style={style} title={s.displayName}>
			{s.type === 'audio' ? (
				<AudioWaveform
					src={s.src}
					doesVolumeChange={s.doesVolumeChange}
					visualizationWidth={width}
					startFrom={s.startMediaFrom}
					durationInFrames={s.duration}
					volume={s.volume}
					setMaxMediaDuration={setMaxMediaDuration}
					playbackRate={s.playbackRate}
				/>
			) : null}
			{s.type === 'video' ? <TimelineVideoInfo src={s.src} /> : null}
			{s.loopDisplay === undefined ? null : (
				<LoopedTimelineIndicator loops={s.loopDisplay.numberOfTimes} />
			)}
		</div>
	);
};
