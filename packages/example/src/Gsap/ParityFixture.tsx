import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import OverlapFixture from './Overlap';
import SamePropertyOverlapFixture from './SamePropertyOverlap';
import SurfaceFixture from './Surface';
import SvgRootFixture from './SvgRoot';

const FixtureCell: React.FC<{
	children: React.ReactNode;
	height: number;
	left: number;
	top: number;
	width: number;
}> = ({children, height, left, top, width}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left,
				top,
				width,
				height,
				overflow: 'hidden',
			}}
		>
			{children}
		</div>
	);
};

const LateOpacityFixture: React.FC = () => {
	const frame = useCurrentFrame();
	const scope = useGsapTimeline<SVGSVGElement>(({timeline}) => {
		const fade = {opacity: 1, duration: 2, ease: 'none'};
		timeline.to('[data-fade]', {...fade}, 0);
		timeline.fromTo('[data-styleless]:not([style])', {opacity: 0}, fade, 0);
	});

	return (
		<svg ref={scope} width={100} height={100}>
			<rect
				data-fade
				width={40}
				height={100}
				fill="red"
				style={{opacity: frame < 30 ? 0.25 : 0.5}}
			/>
			<rect data-styleless x={40} width={40} height={100} fill="lime" />
			<Sequence from={30} layout="none">
				<rect
					data-fade
					x={80}
					width={20}
					height={100}
					fill="blue"
					style={{opacity: 0}}
				/>
			</Sequence>
		</svg>
	);
};

const ParityFixture: React.FC = () => {
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<FixtureCell width={320} height={180} left={0} top={0}>
				<SurfaceFixture />
			</FixtureCell>
			<FixtureCell width={320} height={180} left={320} top={0}>
				<OverlapFixture />
			</FixtureCell>
			<FixtureCell width={320} height={120} left={0} top={180}>
				<SamePropertyOverlapFixture />
			</FixtureCell>
			<FixtureCell width={100} height={100} left={320} top={180}>
				<SvgRootFixture />
			</FixtureCell>
			<FixtureCell width={100} height={100} left={420} top={180}>
				<LateOpacityFixture />
			</FixtureCell>
		</AbsoluteFill>
	);
};

export default ParityFixture;
