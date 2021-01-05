import React from 'react';
import {Composition} from 'remotion';
import Any from './Any';

export const Index: React.FC = () => {
	return (
		<>
			<Composition
				id="nested"
				lazyComponent={() => import('./NestedSequences')}
				durationInFrames={200}
				fps={60}
				height={1080}
				width={1080}
			/>
			<Composition
				id="hey"
				lazyComponent={() => import('./3DText')}
				durationInFrames={200}
				fps={60}
				height={1080}
				width={1080}
			/>
			<Composition
				id="any"
				component={Any}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				id="beta-text"
				lazyComponent={() => import('./BetaText')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				id="big-rotate"
				lazyComponent={() => import('./BigRotate')}
				width={1080}
				height={1080}
				fps={60}
				durationInFrames={3 * 30}
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
				id="end-logo"
				lazyComponent={() => import('./Circle')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				id="coin-animation"
				lazyComponent={() => import('./CoinAnimation')}
				width={100}
				height={200}
				fps={50}
				durationInFrames={70}
			/>
			<Composition
				id="devices"
				lazyComponent={() => import('./Devices')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
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
				id="game-changer"
				lazyComponent={() => import('./GameChanger/gamechanger')}
				width={1920 * 2}
				height={1080 * 2}
				fps={30}
				durationInFrames={2 * 30}
			/>
			<Composition
				id="game-changer-2"
				lazyComponent={() => import('./GameChanger')}
				width={1920 * 2}
				height={1080 * 2}
				fps={30}
				durationInFrames={2 * 30}
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
				id="layout"
				lazyComponent={() => import('./Layout')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
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
			/>
			<Composition
				id="real-stickers"
				lazyComponent={() => import('./RealStickers')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={30 * 2.2}
			/>
			<Composition
				id="screen-showcase"
				lazyComponent={() => import('./ScreenShowcase')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={100}
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
				id="springy"
				lazyComponent={() => import('./Springy')}
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
				id="up"
				lazyComponent={() => import('./Up')}
				width={1080}
				height={1080}
				fps={30}
				defaultProps={{
					line1: 'abc',
					line2: 'def',
				}}
				durationInFrames={120}
			/>
			<Composition
				id="video"
				lazyComponent={() => import('./Vid')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30 * 30}
			/>
			<Composition
				id="welcome"
				lazyComponent={() => import('./Welcome')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={31 * 30}
			/>
		</>
	);
};
