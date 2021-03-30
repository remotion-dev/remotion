import React, {useMemo, useState} from 'react';
import {Internals, TSequence} from 'remotion';
import {
	getTimelineSequenceLayout,
	SEQUENCE_BORDER_WIDTH,
} from '../../helpers/get-timeline-sequence-layout';
import {TIMELINE_LAYER_HEIGHT} from '../../helpers/timeline-layout';
import {useElementSize} from '../../hooks/get-el-size';
import {AudioWaveform} from '../AudioWaveform';
import {Thumbnail} from '../Thumbnail';
import {sliderAreaRef} from './timeline-refs';

const SEQUENCE_GRADIENT = 'linear-gradient(to bottom, #3697e1, #348AC7 60%)';
const AUDIO_GRADIENT = 'linear-gradient(rgb(16 171 58), rgb(43 165 63) 60%)';

export const TimelineSequence: React.FC<{
	s: TSequence;
	fps: number;
}> = ({s, fps}) => {
	const size = useElementSize(sliderAreaRef);

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
		durationInFrames: s.duration,
		startFrom: s.from,
		maxMediaDuration,
		video,
		windowWidth,
	});

	const style: React.CSSProperties = useMemo(() => {
		return {
			background: s.type === 'audio' ? AUDIO_GRADIENT : SEQUENCE_GRADIENT,
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

	const thumbnailFit = !Internals.FEATURE_FLAG_RICH_PREVIEWS ? 0 : 1;

	return (
		<div key={s.id} style={style} title={s.displayName}>
			<div style={row}>
				{s.type === 'sequence' &&
					new Array(thumbnailFit).fill(true).map((_, i) => {
						const frameToDisplay = Internals.FEATURE_FLAG_RICH_PREVIEWS
							? Math.floor((i / thumbnailFit) * video.durationInFrames)
							: s.from;
						return (
							<Thumbnail
								key={frameToDisplay}
								targetHeight={TIMELINE_LAYER_HEIGHT}
								targetWidth={thumbnailWidth}
								composition={video}
								frameToDisplay={frameToDisplay}
							/>
						);
					})}
			</div>
			{s.type === 'audio' ? (
				<AudioWaveform
					src={s.src}
					visualizationWidth={width}
					startFrom={s.from}
					duration={s.duration}
					fps={fps}
					volume={s.volume ?? 1}
					setMaxMediaDuration={setMaxMediaDuration}
				/>
			) : null}
		</div>
	);
};
