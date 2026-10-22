import React from 'react';
import {AbsoluteFill} from 'remotion';
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
		</AbsoluteFill>
	);
};

export default ParityFixture;
