import {Composition, registerRoot} from '@remotion/core';
import React from 'react';

export const Index: React.FC = () => {
	return (
		<>
			<Composition
				name="hey"
				component={React.lazy(() => import('./3DText'))}
				durationInFrames={200}
				fps={60}
				height={1080}
				width={1080}
			/>
			<Composition
				name="any"
				component={React.lazy(() => import('./Any'))}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="beta-text"
				component={React.lazy(() => import('./BetaText'))}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="big-rotate"
				component={React.lazy(() => import('./BigRotate'))}
				width={1080}
				height={1080}
				fps={60}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="black-gradients"
				component={React.lazy(() => import('./BlackGradients'))}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30}
			/>
			<Composition
				name="end-logo"
				component={React.lazy(() => import('./Circle'))}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="coin-animation"
				component={React.lazy(() => import('./CoinAnimation'))}
				width={100}
				height={200}
				fps={50}
				durationInFrames={70}
			/>
			<Composition
				name="devices"
				component={React.lazy(() => import('./Devices'))}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="features"
				component={React.lazy(() => import('./Features'))}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={4 * 30}
			/>
			<Composition
				name="font"
				component={React.lazy(() => import('./Font'))}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30 * 30}
			/>
			<Composition
				name="game-changer"
				component={React.lazy(() => import('./GameChanger/gamechanger'))}
				width={1920 * 2}
				height={1080 * 2}
				fps={30}
				durationInFrames={2 * 30}
			/>
			<Composition
				name="game-changer-2"
				component={React.lazy(() => import('./GameChanger'))}
				width={1920 * 2}
				height={1080 * 2}
				fps={30}
				durationInFrames={2 * 30}
			/>
			<Composition
				name="hacker-logo"
				component={React.lazy(() => import('./HackerLogo'))}
				width={1024}
				height={1024}
				fps={1}
				durationInFrames={1}
			/>
			<Composition
				name="layout"
				component={React.lazy(() => import('./Layout'))}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="rating"
				component={React.lazy(() => import('./NewPackAnnouncement'))}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={7 * 30}
			/>
			<Composition
				name="react-svg"
				component={React.lazy(() => import('./ReactSvg'))}
				width={1920}
				height={1080}
				fps={60}
				durationInFrames={300}
			/>
			<Composition
				name="real-stickers"
				component={React.lazy(() => import('./RealStickers'))}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={30 * 2.2}
			/>
			<Composition
				name="screen-showcase"
				component={React.lazy(() => import('./ScreenShowcase'))}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={100}
			/>
			<Composition
				name="shadow-circles"
				component={React.lazy(() => import('./ShadowCircles'))}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={60}
			/>
			<Composition
				name="springy"
				component={React.lazy(() => import('./Springy'))}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={60}
			/>
			<Composition
				name="stagger-type"
				component={React.lazy(() => import('./StaggerType'))}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={45}
			/>
			<Composition
				name="tiles"
				component={React.lazy(() => import('./Tiles'))}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				name="title"
				component={React.lazy(() => import('./Title'))}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				name="up"
				component={React.lazy(() => import('./Up'))}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={120}
			/>
			<Composition
				name="video"
				component={React.lazy(() => import('./Video'))}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30 * 30}
			/>
			<Composition
				name="welcome"
				component={React.lazy(() => import('./Welcome'))}
				width={1920}
				height={1080}
				fps={30}
				durationInFrames={31 * 30}
			/>
		</>
	);
};

registerRoot(Index);
