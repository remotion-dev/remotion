import {Video} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import React from 'react';
import {Series} from 'remotion';

export const Issue8974TransitionSeriesTimeline: React.FC = () => {
	return (
		<TransitionSeries name="Linked timeline TransitionSeries">
			<TransitionSeries.Sequence
				name="Linked clip 01"
				durationInFrames={39}
				trimBefore={0}
			>
				<Video
					name="Linked video 01"
					src="https://remotion.media/video.mp4"
					durationInFrames={39}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={fade()}
				timing={linearTiming({durationInFrames: 15})}
			/>
			<TransitionSeries.Sequence
				name="Linked clip 02"
				durationInFrames={84}
				trimBefore={8}
			>
				<Video name="Linked video 02" src="https://remotion.media/video.webm" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="Linked clip 03"
				durationInFrames={43}
				trimBefore={60}
			>
				<Video name="Linked video 03" src="https://remotion.media/video.mp4" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={slide({direction: 'from-right'})}
				timing={linearTiming({durationInFrames: 22})}
			/>
			<TransitionSeries.Sequence
				name="Linked clip 04"
				durationInFrames={36}
				trimBefore={80}
			>
				<Video name="Linked video 04" src="https://remotion.media/video.webm" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="Linked clip 05"
				durationInFrames={45}
				trimBefore={120}
			>
				<Video name="Linked video 05" src="https://remotion.media/video.mp4" />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

export const Issue8974IndependentVideosTimeline: React.FC = () => {
	return (
		<>
			<Video
				src="https://remotion.media/video.mp4"
				trimBefore={0}
				durationInFrames={78}
			/>
			<Video
				src="https://remotion.media/video.webm"
				trimBefore={12}
				from={78}
				durationInFrames={66}
			/>
			<Video
				src="https://remotion.media/video.mp4"
				trimBefore={72}
				from={144}
				durationInFrames={90}
			/>
			<Video
				src="https://remotion.media/video.webm"
				trimBefore={58}
				from={234}
				durationInFrames={72}
			/>
			<Video
				src="https://remotion.media/video.mp4"
				trimBefore={180}
				from={306}
				durationInFrames={60}
			/>
		</>
	);
};

export const Issue8974SeriesTimeline: React.FC = () => {
	return (
		<Series name="Linked timeline Series">
			<Series.Sequence
				name="Linked clip 01"
				durationInFrames={78}
				trimBefore={0}
			>
				<Video
					name="Linked video 01"
					src="https://remotion.media/video.mp4"
					durationInFrames={78}
				/>
			</Series.Sequence>
			<Series.Sequence
				name="Linked clip 02"
				durationInFrames={66}
				trimBefore={12}
			>
				<Video
					name="Linked video 02"
					src="https://remotion.media/video.webm"
					durationInFrames={66}
				/>
			</Series.Sequence>
			<Series.Sequence
				name="Linked clip 03"
				durationInFrames={90}
				trimBefore={72}
			>
				<Video
					name="Linked video 03"
					src="https://remotion.media/video.mp4"
					durationInFrames={90}
				/>
			</Series.Sequence>
			<Series.Sequence
				name="Linked clip 04"
				durationInFrames={72}
				trimBefore={58}
			>
				<Video
					name="Linked video 04"
					src="https://remotion.media/video.webm"
					durationInFrames={72}
				/>
			</Series.Sequence>
			<Series.Sequence
				name="Linked clip 05"
				durationInFrames={60}
				trimBefore={180}
			>
				<Video
					name="Linked video 05"
					src="https://remotion.media/video.mp4"
					durationInFrames={60}
				/>
			</Series.Sequence>
		</Series>
	);
};
