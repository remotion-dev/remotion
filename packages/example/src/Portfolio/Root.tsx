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
				defaultProps={{
					style: {backgroundColor: '#0B0B0F', overflow: 'visible'},
				}}
				durationInFrames={1530}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Folder name="Portfolio-Scenes">
				<Composition
					id="Intro"
					component={Intro}
					defaultProps={{
						style: {
							backgroundColor: '#0B0B0F',
							justifyContent: 'center',
							alignItems: 'center',
							overflow: 'visible',
						},
					}}
					durationInFrames={150}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="KineticType"
					component={KineticType}
					defaultProps={{
						style: {backgroundColor: '#FF4A1C', overflow: 'visible'},
					}}
					durationInFrames={255}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="ShapeMorph"
					component={ShapeMorph}
					defaultProps={{
						style: {backgroundColor: '#0B0B0F', overflow: 'visible'},
					}}
					durationInFrames={207}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="DataViz"
					component={DataViz}
					defaultProps={{
						style: {backgroundColor: '#F3EFE6', overflow: 'visible'},
					}}
					durationInFrames={204}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Interface"
					component={Interface}
					defaultProps={{
						style: {
							backgroundColor: '#0E0F13',
							backgroundImage:
								'radial-gradient(circle at 70% 48%, rgba(255, 74, 28, 0.22), transparent 42%), radial-gradient(circle at 12% 92%, rgba(96, 110, 255, 0.12), transparent 40%)',
							overflow: 'visible',
						},
					}}
					durationInFrames={252}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Generative"
					component={Generative}
					defaultProps={{
						style: {backgroundColor: '#0B0B0F', overflow: 'visible'},
					}}
					durationInFrames={195}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="CubeWave"
					component={CubeWave}
					defaultProps={{
						style: {backgroundColor: '#F3EFE6', overflow: 'visible'},
					}}
					durationInFrames={210}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Outro"
					component={Outro}
					defaultProps={{
						style: {backgroundColor: '#0B0B0F', overflow: 'visible'},
					}}
					durationInFrames={195}
					fps={30}
					width={1920}
					height={1080}
				/>
			</Folder>
		</>
	);
};
