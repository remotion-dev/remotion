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

const DemoCard: React.FC<{
	readonly title: string;
	readonly description: string;
	readonly children: React.ReactNode;
}> = ({title, description, children}) => {
	return (
		<div>
			<div style={{fontSize: 21, fontWeight: 600, marginBottom: 5}}>
				{title}
			</div>
			<div style={{fontSize: 15, color: '#a7b0c0', marginBottom: 12}}>
				{description}
			</div>
			<div
				style={{
					position: 'relative',
					height: 128,
					overflow: 'hidden',
					borderRadius: 12,
					backgroundColor: '#202936',
				}}
			>
				{children}
			</div>
		</div>
	);
};

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
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: '#101720',
				color: 'white',
				fontFamily: 'Arial, sans-serif',
				padding: 48,
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between'}}>
				<div style={{fontSize: 36, fontWeight: 700}}>Track prototype</div>
				<div
					style={{
						fontSize: 22,
						color: '#a7b0c0',
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					Frame {frame} / 239
				</div>
			</div>
			<div style={{fontSize: 18, color: '#a7b0c0', marginTop: 8}}>
				Five named tracks. Each occupies one timeline row.
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '28px 32px',
					marginTop: 30,
				}}
			>
				<DemoCard
					title="Series"
					description="Three consecutive clips, 80 frames each."
				>
					<Track name="Series">
						<Series>
							<Series.Sequence name="Series A" durationInFrames={80}>
								<Scene color="#3268a8">A</Scene>
							</Series.Sequence>
							<Series.Sequence name="Series B" durationInFrames={80}>
								<Scene color="#6a4daf">B</Scene>
							</Series.Sequence>
							<Series.Sequence name="Series C" durationInFrames={80}>
								<Scene color="#a34777">C</Scene>
							</Series.Sequence>
						</Series>
					</Track>
				</DemoCard>
				<DemoCard
					title="TransitionSeries"
					description="90-frame clips with 15-frame fades: 240 frames total."
				>
					<Track name="Transitions">
						<TransitionSeries>
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
					</Track>
				</DemoCard>
				<DemoCard
					title="TransitionSeries.Overlay"
					description="24-frame flashes: centered at cut 80; shifted +20 at cut 160."
				>
					<Track name="Overlays">
						<TransitionSeries>
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
					</Track>
				</DemoCard>
				<DemoCard
					title="Negative offsets"
					description="Later clips start 20 frames early and cover the previous clip."
				>
					<Track name="Overlapping clips">
						<Series>
							<Series.Sequence name="Overlap A" durationInFrames={100}>
								<Scene color="#517345">A</Scene>
							</Series.Sequence>
							<Series.Sequence
								name="Overlap B"
								durationInFrames={100}
								offset={-20}
							>
								<Scene color="#92742d">B</Scene>
							</Series.Sequence>
							<Series.Sequence
								name="Overlap C"
								durationInFrames={80}
								offset={-20}
							>
								<Scene color="#a15437">C</Scene>
							</Series.Sequence>
						</Series>
					</Track>
				</DemoCard>
			</div>
			<div
				style={{
					fontSize: 18,
					color: '#a7b0c0',
					marginTop: 28,
					marginBottom: 12,
				}}
			>
				Tokens — all eight sequences stay registered while one word is visible.
			</div>
			<div
				style={{
					position: 'relative',
					height: 65,
					borderRadius: 12,
					overflow: 'hidden',
				}}
			>
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
		</div>
	);
};
