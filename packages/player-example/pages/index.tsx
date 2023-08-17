import {staticFile, Video} from 'remotion';
import {AbsoluteFill} from 'remotion';
import {useVideoConfig} from 'remotion';
import {Thumbnail} from '@remotion/player';
import React, {ComponentType} from 'react';
import App from '../src/App';
import CarSlideshow from '../src/CarSlideshow';
import {FontPicker} from '../src/FontPicker';
import {ThumbnailDemo} from '../src/ThumbnailDemo';
import {VideoautoplayDemo} from '../src/VideoAutoplay';

const Car = () =>
	new Promise<{default: ComponentType<unknown>}>((resolve) => {
		setTimeout(
			() =>
				resolve({
					default: CarSlideshow as ComponentType<unknown>,
				}),
			3000
		);
	});

interface Props {
	videoUrl: string;
}

export const MyComposition: React.FC<Props> = (props) => {
	const {width, height} = useVideoConfig();

	return (
		<div
			style={{
				width,
				height,
				position: 'absolute',
				left: 0,
				top: 0,
			}}
		>
			<AbsoluteFill style={{height: '50%', top: 0}}>
				<Video src={staticFile('face.mp4')} />
			</AbsoluteFill>
			<AbsoluteFill style={{height: '50%', top: '50%'}}>
				<Video src={staticFile('screen.mp4')} />
			</AbsoluteFill>
		</div>
	);
};

function Index() {
	return (
		<React.StrictMode>
			<FontPicker />
			<h2>Player</h2>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
				}}
			>
				<App component={MyComposition} durationInFrames={500} />
			</div>
		</React.StrictMode>
	);
}

export default Index;
