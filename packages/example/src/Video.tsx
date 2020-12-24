import React from 'react';
import {Composition} from 'remotion';
import Any from './Any';

export const Index: React.FC = () => {
	return (
		<>
			<Composition
				name="nested"
				lazyComponent={() => import('./NestedSequences')}
				durationInFrames={200}
				fps={60}
				height={1080}
				width={1080}
			/>
			<Composition
				name="hey"
				lazyComponent={() => import('./3DText')}
				durationInFrames={200}
				fps={60}
				height={1080}
				width={1080}
			/>
			<Composition
				name="any"
				component={Any}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="beta-text"
				lazyComponent={() => import('./BetaText')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="big-rotate"
				lazyComponent={() => import('./BigRotate')}
				width={1080}
				height={1080}
				fps={60}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="black-gradients"
				lazyComponent={() => import('./BlackGradients')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30}
			/>
			<Composition
				name="end-logo"
				lazyComponent={() => import('./Circle')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="coin-animation"
				lazyComponent={() => import('./CoinAnimation')}
				width={100}
				height={200}
				fps={50}
				durationInFrames={70}
			/>
			<Composition
				name="devices"
				lazyComponent={() => import('./Devices')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="features"
				lazyComponent={() => import('./Features')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={4 * 30}
			/>
			<Composition
				name="font"
				lazyComponent={() => import('./Font')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30 * 30}
			/>
			<Composition
				name="game-changer"
				lazyComponent={() => import('./GameChanger/gamechanger')}
				width={1920 * 2}
				height={1080 * 2}
				fps={30}
				durationInFrames={2 * 30}
			/>
			<Composition
				name="game-changer-2"
				lazyComponent={() => import('./GameChanger')}
				width={1920 * 2}
				height={1080 * 2}
				fps={30}
				durationInFrames={2 * 30}
			/>
			<Composition
				name="hacker-logo"
				lazyComponent={() => import('./HackerLogo')}
				width={1024}
				height={1024}
				fps={1}
				durationInFrames={1}
			/>
			<Composition
				name="layout"
				lazyComponent={() => import('./Layout')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="rating"
				lazyComponent={() => import('./NewPackAnnouncement')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={7 * 30}
			/>
			<Composition
				name="react-svg"
				lazyComponent={() => import('./ReactSvg')}
				width={1920}
				height={1080}
				fps={60}
				durationInFrames={300}
			/>
			<Composition
				name="real-stickers"
				lazyComponent={() => import('./RealStickers')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={30 * 2.2}
			/>
			<Composition
				name="screen-showcase"
				lazyComponent={() => import('./ScreenShowcase')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={100}
			/>
			<Composition
				name="shadow-circles"
				lazyComponent={() => import('./ShadowCircles')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={60}
			/>
			<Composition
				name="springy"
				lazyComponent={() => import('./Springy')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={60}
			/>
			<Composition
				name="stagger-type"
				lazyComponent={() => import('./StaggerType')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={45}
			/>
			<Composition
				name="tiles"
				lazyComponent={() => import('./Tiles')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				name="title"
				lazyComponent={() => import('./Title')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				name="up"
				lazyComponent={() => import('./Up')}
				width={1080}
				height={1080}
				fps={30}
				props={{
					line1: 'abc',
					line2: 'def',
				}}
				durationInFrames={120}
			/>
			<Composition
				name="video"
				lazyComponent={() => import('./Vid')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30 * 30}
			/>
			<Composition
				name="welcome"
				lazyComponent={() => import('./Welcome')}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={31 * 30}
			/>
		</>
	);
};
