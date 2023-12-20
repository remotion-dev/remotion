import React from 'react';
import {Audio, Loop, Sequence, staticFile, Video} from 'remotion';

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
		</Sequence>
	);
};
