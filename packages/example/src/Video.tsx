import React from 'react';
import {Composition, getInputProps} from 'remotion';
import {Framer} from './Framer';
import {MissingImg} from './MissingImg';
import {TenFrameTester} from './TenFrameTester';
import {VideoTesting} from './VideoTesting';

export const Index: React.FC = () => {
	const inputProps = getInputProps();
	return (
		<>
			<Composition
				id="dynamic-duration"
				component={VideoTesting}
				width={1080}
				height={1080}
				fps={30}
				// Change the duration of the video dynamically by passing `--props='{"duration": 100}'`
				durationInFrames={inputProps?.duration ?? 20}
			/>
			<Composition
				id="nested"
				lazyComponent={() => import('./NestedSequences')}
				durationInFrames={200}
				fps={60}
				height={1080}
				width={1080}
			/>
			<Composition
				id="beta-text"
				lazyComponent={() => import('./BetaText')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={3 * 30}
				defaultProps={{
					word1: getInputProps().word1,
				}}
			/>
			<Composition
				id="black-gradients"
				lazyComponent={() => import('./BlackGradients')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30}
			/>
			<Composition
				id="features"
				lazyComponent={() => import('./Features')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={4 * 30}
			/>
			<Composition
				id="font"
				lazyComponent={() => import('./Font')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30 * 30}
			/>

			<Composition
				id="hacker-logo"
				lazyComponent={() => import('./HackerLogo')}
				width={1024}
				height={1024}
				fps={1}
				durationInFrames={1}
			/>
			<Composition
				id="rating"
				lazyComponent={() => import('./NewPackAnnouncement')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={7 * 30}
			/>
			<Composition
				id="react-svg"
				lazyComponent={() => import('./ReactSvg')}
				width={1920}
				height={1080}
				fps={60}
				durationInFrames={300}
				defaultProps={{
					transparent: true,
				}}
			/>
			<Composition
				id="shadow-circles"
				lazyComponent={() => import('./ShadowCircles')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={60}
			/>
			<Composition
				id="stagger-type"
				lazyComponent={() => import('./StaggerType')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={45}
			/>
			<Composition
				id="tiles"
				lazyComponent={() => import('./Tiles')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				id="title"
				lazyComponent={() => import('./Title')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				id="mdx-test"
				lazyComponent={() => import('./MdxTest')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30 * 30}
			/>
			<Composition
				id="react-native-web"
				lazyComponent={() => import('./ReactNativeWeb')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30 * 30}
			/>
			<Composition
				id="iframe"
				lazyComponent={() => import('./IframeTest')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={10}
			/>
			<Composition
				id="missing-img"
				component={MissingImg}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={10}
			/>
			<Composition
				id="ten-frame-tester"
				component={TenFrameTester}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={10}
			/>
			<Composition
				id="video-testing"
				component={VideoTesting}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={100}
			/>
			<Composition
				id="framer"
				component={Framer}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={100}
			/>
		</>
	);
};
