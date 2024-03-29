import React from 'react';
import {Audio, Loop, Sequence, Series, staticFile, Video} from 'remotion';
import {BasicTransition} from '../Transitions/BasicTransition';

export const Layers: React.FC = () => {
	return (
		<Sequence>
			<Sequence from={90}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi there</Sequence>
			<Sequence from={10}>hi yaaa</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Loop durationInFrames={30}>
				<Sequence>hi</Sequence>
			</Loop>
			<Audio src={staticFile('music.mp3')} />
			<Video src={staticFile('vid1.mp4')} />
			<BasicTransition />
			<Series>
				<Series.Sequence durationInFrames={40}>hi there</Series.Sequence>
				<Series.Sequence durationInFrames={40}>hi there</Series.Sequence>
			</Series>
		</Sequence>
	);
};
