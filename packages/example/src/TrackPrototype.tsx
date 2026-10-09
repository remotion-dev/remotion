import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import React from 'react';
import {
	interpolate,
	Sequence,
	Series,
	Track,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const Scene: React.FC<{
	readonly color: string;
	readonly children: React.ReactNode;
}> = ({color, children}) => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: color,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: 34,
				fontWeight: 600,
			}}
		>
			{children}
		</div>
	);
};

const Flash: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: '#fff2b8',
				opacity: interpolate(
					frame,
					[0, durationInFrames / 2, durationInFrames],
					[0, 0.95, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				),
			}}
		/>
	);
};

export const TrackPrototype: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: '#101720',
				color: 'white',
				fontFamily: 'Arial, sans-serif',
			}}
		>
			<Series name="Series">
				<Series.Sequence name="Series A" durationInFrames={80}>
					<Scene color="#3268a8">A</Scene>
				</Series.Sequence>
				<Series.Sequence name="Series C" durationInFrames={80}>
					<Scene color="#a34777">C</Scene>
				</Series.Sequence>
				<Series.Sequence name="Series B" durationInFrames={54}>
					<Scene color="#6a4daf">B</Scene>
				</Series.Sequence>
			</Series>
			<TransitionSeries name="Transitions">
				<TransitionSeries.Sequence name="Fade A" durationInFrames={90}>
					<Scene color="#327e79">A</Scene>
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={fade()}
					timing={linearTiming({durationInFrames: 15})}
				/>
				<TransitionSeries.Sequence name="Fade B" durationInFrames={90}>
					<Scene color="#967130">B</Scene>
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={fade()}
					timing={linearTiming({durationInFrames: 15})}
				/>
				<TransitionSeries.Sequence name="Fade C" durationInFrames={90}>
					<Scene color="#a34a43">C</Scene>
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<TransitionSeries name="Nonoverlapping overlays">
				<TransitionSeries.Sequence name="Overlay A" durationInFrames={80}>
					<Scene color="#436582">A</Scene>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={24}>
					<Flash />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence name="Overlay B" durationInFrames={80}>
					<Scene color="#774e90">B</Scene>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={24} offset={20}>
					<Flash />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence name="Overlay C" durationInFrames={80}>
					<Scene color="#8f5f48">C</Scene>
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<TransitionSeries name="Overlapping overlays">
				<TransitionSeries.Sequence name="Scene A" durationInFrames={80}>
					<Scene color="#355c6e">A</Scene>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={80}>
					<div
						style={{
							position: 'absolute',
							top: 12,
							left: 12,
							padding: '8px 12px',
							borderRadius: 6,
							backgroundColor: '#7de1c0',
							color: '#102e24',
							fontSize: 18,
							fontWeight: 600,
						}}
					>
						Overlay 1 · 40–119
					</div>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence name="Short scene B" durationInFrames={40}>
					<Scene color="#44566e">B</Scene>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={80}>
					<div
						style={{
							position: 'absolute',
							bottom: 12,
							right: 12,
							padding: '8px 12px',
							borderRadius: 6,
							backgroundColor: '#f1c27a',
							color: '#392710',
							fontSize: 18,
							fontWeight: 600,
						}}
					>
						Overlay 2 · 80–159
					</div>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence name="Scene C" durationInFrames={120}>
					<Scene color="#6b526e">C</Scene>
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<Series name="Overlapping clips">
				<Series.Sequence name="Overlap A" durationInFrames={100}>
					<Scene color="#517345">A</Scene>
				</Series.Sequence>
				<Series.Sequence name="Overlap B" durationInFrames={100} offset={-20}>
					<Scene color="#92742d">B</Scene>
				</Series.Sequence>
				<Series.Sequence name="Overlap C" durationInFrames={80} offset={-20}>
					<Scene color="#a15437">C</Scene>
				</Series.Sequence>
			</Series>
			<Track name="Caption tokens">
				<Sequence name="Every" durationInFrames={30}>
					<Scene color="#27354a">Every</Scene>
				</Sequence>
				<Sequence name="caption" from={30} durationInFrames={30}>
					<Scene color="#27354a">caption</Scene>
				</Sequence>
				<Sequence name="token" from={60} durationInFrames={30}>
					<Scene color="#27354a">token</Scene>
				</Sequence>
				<Sequence name="stays" from={90} durationInFrames={30}>
					<Scene color="#27354a">stays</Scene>
				</Sequence>
				<Sequence name="visible" from={120} durationInFrames={30}>
					<Scene color="#27354a">visible</Scene>
				</Sequence>
				<Sequence name="in" from={150} durationInFrames={30}>
					<Scene color="#27354a">in</Scene>
				</Sequence>
				<Sequence name="one" from={180} durationInFrames={30}>
					<Scene color="#27354a">one</Scene>
				</Sequence>
				<Sequence name="track" from={210} durationInFrames={30}>
					<Scene color="#27354a">track</Scene>
				</Sequence>
			</Track>
		</div>
	);
};
