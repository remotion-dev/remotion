import {Composition, registerRoot} from '@remotion/core';
import React from 'react';
import {Hey} from './3DText';
import {Any} from './Any';
import {BetaText} from './BetaText';
import {BigRotate} from './BigRotate';
import {BlackGradients} from './BlackGradients';
import {EndLogo} from './Circle';
import {CoinAnimation} from './CoinAnimation';
import {Devices} from './Devices';
import {Features} from './Features';
import {Comp} from './Font';
import {GameChanger} from './GameChanger';
import {GameChangerMain} from './GameChanger/gamechanger';
import {HackerLogo} from './HackerLogo';
import {Layout} from './Layout';
import {Rating} from './NewPackAnnouncement';
import {ReactSvg} from './ReactSvg';
import {RealStickers} from './RealStickers';
import {ScreenShowcase} from './ScreenShowcase';
import {ShadowCircles} from './ShadowCircles';
import {Springy} from './Springy';
import {StaggerType} from './StaggerType';
import {TextStickerShowCase} from './TextStickerShowcase';
import {Tiles} from './Tiles';
import {Title} from './Title';
import {Up} from './Up';
import {VideoComp} from './Video';
import {Welcome} from './Welcome';

export const Index: React.FC = () => {
	return (
		<>
			<Composition
				name="hey"
				component={Hey}
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
				component={BetaText}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="big-rotate"
				component={BigRotate}
				width={1080}
				height={1080}
				fps={60}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="black-gradients"
				component={BlackGradients}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30}
			/>
			<Composition
				name="end-logo"
				component={EndLogo}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="coin-animation"
				component={CoinAnimation}
				width={100}
				height={200}
				fps={50}
				durationInFrames={70}
			/>
			<Composition
				name="devices"
				component={Devices}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="features"
				component={Features}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={4 * 30}
			/>
			<Composition
				name="font"
				component={Comp}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30 * 30}
			/>
			<Composition
				name="game-changer"
				component={GameChangerMain}
				width={1920 * 2}
				height={1080 * 2}
				fps={30}
				durationInFrames={2 * 30}
			/>
			<Composition
				name="game-changer-2"
				component={GameChanger}
				width={1920 * 2}
				height={1080 * 2}
				fps={30}
				durationInFrames={2 * 30}
			/>
			<Composition
				name="hacker-logo"
				component={HackerLogo}
				width={1024}
				height={1024}
				fps={1}
				durationInFrames={1}
			/>
			<Composition
				name="layout"
				component={Layout}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={3 * 30}
			/>
			<Composition
				name="rating"
				component={Rating}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={7 * 30}
			/>
			<Composition
				name="react-svg"
				component={ReactSvg}
				width={1920}
				height={1080}
				fps={60}
				durationInFrames={300}
			/>
			<Composition
				name="real-stickers"
				component={RealStickers}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={30 * 2.2}
			/>
			<Composition
				name="screen-showcase"
				component={ScreenShowcase}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={100}
			/>
			<Composition
				name="shadow-circles"
				component={ShadowCircles}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={60}
			/>
			<Composition
				name="springy"
				component={Springy}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={60}
			/>
			<Composition
				name="stagger-type"
				component={StaggerType}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={45}
			/>
			<Composition
				name="text-sticker-showcase"
				component={TextStickerShowCase}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				name="tiles"
				component={Tiles}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				name="title"
				component={Title}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={90}
			/>
			<Composition
				name="up"
				component={Up}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={120}
			/>
			<Composition
				name="video"
				component={VideoComp}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={30 * 30}
			/>
			<Composition
				name="welcome"
				component={Welcome}
				width={1920}
				height={1080}
				fps={30}
				durationInFrames={31 * 30}
			/>
		</>
	);
};

registerRoot(Index);
