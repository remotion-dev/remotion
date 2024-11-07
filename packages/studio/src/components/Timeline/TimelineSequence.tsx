import React, {useContext, useMemo, useState} from 'react';
import type {TSequence} from 'remotion';
import {Internals, useCurrentFrame} from 'remotion';
import {BLUE} from '../../helpers/colors';
import {
	SEQUENCE_BORDER_WIDTH,
	getTimelineSequenceLayout,
} from '../../helpers/get-timeline-sequence-layout';
import {TIMELINE_LAYER_HEIGHT} from '../../helpers/timeline-layout';
import {AudioWaveform} from '../AudioWaveform';
import {LoopedTimelineIndicator} from './LoopedTimelineIndicators';
import {TimelineSequenceFrame} from './TimelineSequenceFrame';
import {TimelineVideoInfo} from './TimelineVideoInfo';
import {TimelineWidthContext} from './TimelineWidthProvider';

const AUDIO_GRADIENT = 'linear-gradient(rgb(16 171 58), rgb(43 165 63) 60%)';
const VIDEO_GRADIENT = 'linear-gradient(to top, #8e44ad, #9b59b6)';

export const TimelineSequence: React.FC<{
	readonly s: TSequence;
}> = ({s}) => {
	const windowWidth = useContext(TimelineWidthContext);

	if (windowWidth === null) {
		return null;
	}

	return <Inner windowWidth={windowWidth} s={s} />;
};

const Inner: React.FC<{
	readonly s: TSequence;
	readonly windowWidth: number;
}> = ({s, windowWidth}) => {
	// If a duration is 1, it is essentially a still and it should have width 0
	// Some compositions may not be longer than their media duration,
	// if that is the case, it needs to be asynchronously determined
	const [maxMediaDuration, setMaxMediaDuration] = useState(Infinity);

	const video = Internals.useVideo();

	if (!video) {
		throw new TypeError('Expected video config');
	}

	const frame = useCurrentFrame();
	const relativeFrame = frame - s.from;
	const relativeFrameWithPremount = relativeFrame + (s.premountDisplay ?? 0);

	const roundedFrame = Math.round(relativeFrame * 100) / 100;

	const isInRange = relativeFrame >= 0 && relativeFrame < s.duration;
	const isPremounting =
		relativeFrameWithPremount >= 0 &&
		relativeFrameWithPremount < s.duration &&
		!isInRange;

	const {marginLeft, width, premountWidth} = useMemo(() => {
		return getTimelineSequenceLayout({
			durationInFrames: s.loopDisplay
				? s.loopDisplay.durationInFrames * s.loopDisplay.numberOfTimes
				: s.duration,
			startFrom: s.loopDisplay ? s.from + s.loopDisplay.startOffset : s.from,
			startFromMedia: s.type === 'sequence' ? 0 : s.startMediaFrom,
			maxMediaDuration,
			video,
			windowWidth,
			premountDisplay: s.premountDisplay,
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
			borderRadius: 2,
			position: 'absolute',
			height: TIMELINE_LAYER_HEIGHT,
			marginLeft,
			width,
			color: 'white',
			overflow: 'hidden',
			opacity: isInRange ? 1 : 0.5,
		};
	}, [isInRange, marginLeft, s.type, width]);

	return (
		<div key={s.id} style={style} title={s.displayName}>
			{premountWidth ? (
				<div
					style={{
						width: premountWidth,
						height: '100%',
						background: `repeating-linear-gradient(
							-45deg,
							transparent,
							transparent 2px,
							rgba(255, 255, 255, ${isPremounting ? 0.5 : 0.2}) 2px,
							rgba(255, 255, 255, ${isPremounting ? 0.5 : 0.2}) 4px
						)`,
						position: 'absolute',
					}}
				/>
			) : null}

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

			{s.type !== 'audio' &&
			s.type !== 'video' &&
			s.loopDisplay === undefined &&
			(isInRange || isPremounting) ? (
				<div
					style={{
						paddingLeft: 5 + (premountWidth ?? 0),
						height: '100%',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<TimelineSequenceFrame
						premounted={isPremounting}
						roundedFrame={roundedFrame}
					/>
				</div>
			) : null}
		</div>
	);
};
