import React from 'react';
import {Composition, Folder} from 'remotion';
import {Portfolio} from './Portfolio';
import {CubeWave} from './scenes/CubeWave';
import {DataViz} from './scenes/DataViz';
import {Generative} from './scenes/Generative';
import {Interface} from './scenes/Interface';
import {Intro} from './scenes/Intro';
import {KineticType} from './scenes/KineticType';
import {Outro} from './scenes/Outro';
import {ShapeMorph} from './scenes/ShapeMorph';

export const PortfolioCompositions: React.FC = () => {
	return (
		<>
			<Composition
				id="Portfolio"
				component={Portfolio}
				durationInFrames={1530}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Folder name="Portfolio-Scenes">
				<Composition
					id="Intro"
					component={Intro}
					durationInFrames={150}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="KineticType"
					component={KineticType}
					durationInFrames={255}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="ShapeMorph"
					component={ShapeMorph}
					durationInFrames={207}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="DataViz"
					component={DataViz}
					durationInFrames={204}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Interface"
					component={Interface}
					durationInFrames={252}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Generative"
					component={Generative}
					durationInFrames={195}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="CubeWave"
					component={CubeWave}
					durationInFrames={210}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Outro"
					component={Outro}
					durationInFrames={195}
					fps={30}
					width={1920}
					height={1080}
				/>
			</Folder>
		</>
	);
};
