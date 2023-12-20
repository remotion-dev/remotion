import React from 'react';
import {Audio, Sequence, staticFile, Video} from 'remotion';

export const Layers: React.FC = () => {
	return (
		<Sequence>
			<Sequence from={90}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Sequence from={10}>hi</Sequence>
			<Audio src={staticFile('music.mp3')} />
			<Video src={staticFile('vid1.mp4')} />
		</Sequence>
	);
};
