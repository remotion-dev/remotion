import {PlayerInternals} from '@remotion/player';
import React, {useContext, useMemo, useState} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {
	getTimelineSequenceLayout,
	SEQUENCE_BORDER_WIDTH,
} from '../../helpers/get-timeline-sequence-layout';
import {TIMELINE_LAYER_HEIGHT} from '../../helpers/timeline-layout';
import {RichTimelineContext} from '../../state/rich-timeline';
import {TimelineZoomCtx} from '../../state/timeline-zoom';
import {AudioWaveform} from '../AudioWaveform';
import {Thumbnail} from '../Thumbnail';
import {LoopedTimelineIndicator} from './LoopedTimelineIndicators';
import {sliderAreaRef} from './timeline-refs';
import {TimelineVideoInfo} from './TimelineVideoInfo';

const SEQUENCE_GRADIENT = 'linear-gradient(to bottom, #3697e1, #348AC7 60%)';
const AUDIO_GRADIENT = 'linear-gradient(rgb(16 171 58), rgb(43 165 63) 60%)';
const VIDEO_GRADIENT = 'linear-gradient(to top, #8e44ad, #9b59b6)';

export const TimelineSequence: React.FC<{
	s: TSequence;
	fps: number;
}> = ({s, fps}) => {
	const size = PlayerInternals.useElementSize(sliderAreaRef, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});

	const {zoom} = useContext(TimelineZoomCtx);
	const {richTimeline} = useContext(RichTimelineContext);

	const windowWidth = size?.width ?? 0;
	// If a duration is 1, it is essentially a still and it should have width 0
	// Some compositions may not be longer than their media duration,
	// if that is the case, it needs to be asynchronously determined
	const [maxMediaDuration, setMaxMediaDuration] = useState(Infinity);

	const video = Internals.useVideo();

	if (!video) {
		throw new TypeError('Expected video config');
	}

	const {marginLeft, width} = getTimelineSequenceLayout({
		durationInFrames: s.duration * (s.showLoopTimesInTimeline ?? 1),
		startFrom: s.from,
		startFromMedia: s.type === 'sequence' ? 0 : s.startMediaFrom,
		maxMediaDuration,
		video,
		windowWidth,
		zoom,
	});

	const style: React.CSSProperties = useMemo(() => {
		return {
			background:
				s.type === 'audio'
					? AUDIO_GRADIENT
					: s.type === 'video'
					? VIDEO_GRADIENT
					: SEQUENCE_GRADIENT,
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

	const row: React.CSSProperties = useMemo(() => {
		return {
			flexDirection: 'row',
			display: 'flex',
			borderRadius: 5,
			overflow: 'hidden',
		};
	}, []);

	const thumbnailWidth = TIMELINE_LAYER_HEIGHT * (video.width / video.height);

	return (
		<div key={s.id} style={style} title={s.displayName}>
			<div style={row}>
				{richTimeline && s.type === 'sequence' ? (
					<Thumbnail
						targetHeight={TIMELINE_LAYER_HEIGHT}
						targetWidth={thumbnailWidth}
						composition={video}
						frameToDisplay={Math.floor(s.from + s.duration / 2)}
					/>
				) : null}
			</div>
			{s.type === 'audio' ? (
				<AudioWaveform
					src={s.src}
					doesVolumeChange={s.doesVolumeChange}
					visualizationWidth={width}
					startFrom={s.startMediaFrom}
					durationInFrames={s.duration}
					fps={fps}
					volume={s.volume}
					setMaxMediaDuration={setMaxMediaDuration}
				/>
			) : null}
			{s.type === 'video' ? <TimelineVideoInfo src={s.src} /> : null}
			{s.showLoopTimesInTimeline === undefined ? null : (
				<LoopedTimelineIndicator loops={s.showLoopTimesInTimeline} />
			)}
		</div>
	);
};
