import {Video} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import React from 'react';
import {Sequence} from 'remotion';

export const Issue8974TransitionSeriesTimeline: React.FC = () => {
	return (
		<TransitionSeries name="Linked timeline TransitionSeries">
			<TransitionSeries.Sequence name="Linked clip 01" durationInFrames={42}>
				<Video
					name="Linked video 01"
					src="https://remotion.media/video.mp4"
					trimBefore={0}
					trimAfter={42}
					muted
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: 8})}
				presentation={fade()}
			/>
			<TransitionSeries.Sequence name="Linked clip 02" durationInFrames={50}>
				<Video
					name="Linked video 02"
					src="https://remotion.media/video.webm"
					trimBefore={8}
					trimAfter={58}
					muted
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: 8})}
				presentation={fade()}
			/>
			<TransitionSeries.Sequence name="Linked clip 03" durationInFrames={36}>
				<Video
					name="Linked video 03"
					src="https://remotion.media/video.mp4"
					trimBefore={60}
					trimAfter={96}
					muted
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: 8})}
				presentation={fade()}
			/>
			<TransitionSeries.Sequence name="Linked clip 04" durationInFrames={46}>
				<Video
					name="Linked video 04"
					src="https://remotion.media/video.webm"
					trimBefore={70}
					trimAfter={116}
					muted
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: 8})}
				presentation={fade()}
			/>
			<TransitionSeries.Sequence name="Linked clip 05" durationInFrames={56}>
				<Video
					name="Linked video 05"
					src="https://remotion.media/video.mp4"
					trimBefore={120}
					trimAfter={176}
					muted
				/>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

export const Issue8974IndependentVideosTimeline: React.FC = () => {
	return (
		<>
			<Sequence name="Independent clip 01" durationInFrames={78}>
				<Video src="https://remotion.media/video.mp4" trimBefore={0} />
			</Sequence>
			<Sequence name="Independent clip 02" from={78} durationInFrames={66}>
				<Video src="https://remotion.media/video.webm" trimBefore={12} />
			</Sequence>
			<Sequence name="Independent clip 03" from={144} durationInFrames={90}>
				<Video src="https://remotion.media/video.mp4" trimBefore={72} />
			</Sequence>
			<Sequence name="Independent clip 04" from={234} durationInFrames={72}>
				<Video src="https://remotion.media/video.webm" trimBefore={58} />
			</Sequence>
			<Sequence name="Independent clip 05" from={306} durationInFrames={60}>
				<Video src="https://remotion.media/video.mp4" trimBefore={180} />
			</Sequence>
		</>
	);
};
