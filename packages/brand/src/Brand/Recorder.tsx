import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {getColor, Theme} from './colors';

const O: React.FC = () => {
	return (
		<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
			<path
				d="M660.364 539.204C660.364 560.42 643.645 577.067 623.694 577.067C603.742 577.067 587.024 560.42 587.024 539.204C587.024 517.989 603.742 501.342 623.694 501.342C643.645 501.342 660.364 517.989 660.364 539.204Z"
				stroke="currentColor"
				strokeWidth="27.4281"
			/>
		</svg>
	);
};

const R1: React.FC = () => {
	return (
		<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
			<path
				d="M299 577.067V535.329C299 516.558 314.216 501.342 332.987 501.342V501.342"
				stroke="currentColor"
				strokeWidth="27.4281"
				strokeLinecap="square"
			/>
		</svg>
	);
};

const R2: React.FC = () => {
	return (
		<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
			<path
				d="M696.31 577.067V535.329C696.31 516.558 711.526 501.342 730.297 501.342V501.342"
				stroke="currentColor"
				strokeWidth="27.4281"
				strokeLinecap="square"
			/>
		</svg>
	);
};
const R3: React.FC = () => {
	return (
		<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
			<path
				d="M989.31 577.067V535.329C989.31 516.558 1004.53 501.342 1023.3 501.342V501.342"
				stroke="currentColor"
				strokeWidth="27.4281"
				strokeLinecap="square"
			/>{' '}
		</svg>
	);
};

const D: React.FC = () => {
	return (
		<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
			<circle
				cx="800.886"
				cy="539.204"
				r="37.8627"
				stroke="currentColor"
				strokeWidth="27.4281"
			/>
			<path
				d="M838.81 529.725V454"
				stroke="currentColor"
				strokeWidth="27"
				strokeLinecap="square"
			/>
		</svg>
	);
};

const E: React.FC = () => {
	return (
		<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
			<mask
				id="mask0_20_679"
				style={{maskType: 'alpha'}}
				maskUnits="userSpaceOnUse"
				x="351"
				y="487"
				width="104"
				height="104"
			>
				<circle
					cx="402.924"
					cy="538.906"
					r="39.3533"
					fill="currentColor"
					stroke="currentColor"
					strokeWidth="23.8505"
				/>
			</mask>
			<g mask="url(#mask0_20_679)">
				<path
					d="M361.781 528.174H448.836C456.41 528.174 462.55 534.314 462.55 541.888V547.85H361.781V528.174Z"
					fill="currentColor"
				/>
			</g>
			<mask
				id="mask1_20_679"
				style={{maskType: 'alpha'}}
				maskUnits="userSpaceOnUse"
				x="336"
				y="475"
				width="126"
				height="137"
			>
				<path
					d="M417.234 539.503H456.289L461.357 478.982L441.979 475.702L342.403 478.982L336.738 611.65H426.774L457.78 557.689H417.234V539.503Z"
					fill="currentColor"
				/>
			</mask>
			<g mask="url(#mask1_20_679)">
				<path
					d="M440.488 539.204C440.488 560.19 423.595 577.067 402.924 577.067C382.252 577.067 365.359 560.19 365.359 539.204C365.359 518.218 382.252 501.342 402.924 501.342C423.595 501.342 440.488 518.218 440.488 539.204Z"
					stroke="currentColor"
					strokeWidth="27.4281"
				/>
			</g>
		</svg>
	);
};

const C: React.FC = () => {
	return (
		<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
			<g mask="url(#mask4_20_679)" />
			<mask
				id="mask5_20_679"
				style={{maskType: 'alpha'}}
				maskUnits="userSpaceOnUse"
				x="448"
				y="475"
				width="125"
				height="137"
			>
				<path
					d="M528.805 528H567.86L572.928 478.982L553.55 475.702L453.974 478.982L448.31 611.65H538.345L569.351 548H528.805V528Z"
					fill="currentColor"
				/>
			</mask>
			<g mask="url(#mask5_20_679)">
				<path
					d="M552.059 539.204C552.059 560.19 535.166 577.067 514.495 577.067C493.823 577.067 476.93 560.19 476.93 539.204C476.93 518.218 493.823 501.342 514.495 501.342C535.166 501.342 552.059 518.218 552.059 539.204Z"
					stroke="currentColor"
					strokeWidth="27.4281"
				/>
			</g>
		</svg>
	);
};

const E2: React.FC = () => {
	return (
		<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
			<mask
				id="mask2_20_679"
				style={{maskType: 'alpha'}}
				maskUnits="userSpaceOnUse"
				x="861"
				y="487"
				width="103"
				height="104"
			>
				<circle
					cx="912.495"
					cy="538.906"
					r="39.3533"
					fill="currentColor"
					stroke="currentColor"
					strokeWidth="23.8505"
				/>
			</mask>
			<g mask="url(#mask2_20_679)">
				<path
					d="M871.353 528.174H958.407C965.981 528.174 972.121 534.314 972.121 541.888V547.85H871.353V528.174Z"
					fill="currentColor"
				/>
			</g>
			<mask
				id="mask3_20_679"
				style={{maskType: 'alpha'}}
				maskUnits="userSpaceOnUse"
				x="846"
				y="475"
				width="125"
				height="137"
			>
				<path
					d="M926.805 539.503H965.86L970.928 478.982L951.55 475.702L851.974 478.982L846.31 611.65H936.345L967.351 557.689H926.805V539.503Z"
					fill="currentColor"
				/>
			</mask>
			<g mask="url(#mask3_20_679)">
				<path
					d="M950.059 539.204C950.059 560.19 933.166 577.067 912.495 577.067C891.823 577.067 874.93 560.19 874.93 539.204C874.93 518.218 891.823 501.342 912.495 501.342C933.166 501.342 950.059 518.218 950.059 539.204Z"
					stroke="currentColor"
					strokeWidth="27.4281"
				/>
			</g>
			<mask
				id="mask4_20_679"
				style={{maskType: 'alpha'}}
				maskUnits="userSpaceOnUse"
				x="463"
				y="487"
				width="103"
				height="104"
			>
				<circle
					cx="514.495"
					cy="538.906"
					r="39.3533"
					fill="currentColor"
					stroke="currentColor"
					strokeWidth="23.8505"
				/>
			</mask>
		</svg>
	);
};

const FromRight: React.FC<{
	children: React.ReactNode;
	delay: number;
}> = ({children, delay}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const spr = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: Number(delay) + 28.2,
	});

	const rotation = interpolate(spr, [0, 1], [-Math.PI / 2, 0]);

	return (
		<AbsoluteFill
			style={{
				transform: `rotate(${rotation}rad)`,
				transformOrigin: '150% 50%',
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

export const Recorder: React.FC<{
	theme: Theme;
}> = ({theme}) => {
	return (
		<AbsoluteFill
			style={{
				maskImage: `linear-gradient(black 58%, transparent 74%)`,
			}}
		>
			<AbsoluteFill style={{overflow: 'visible', color: getColor(theme)}}>
				<FromRight delay={0}>
					<R1 />
				</FromRight>
				<FromRight delay={1}>
					<E />
				</FromRight>
				<FromRight delay={2}>
					<C />
				</FromRight>
				<FromRight delay={3}>
					<O />
				</FromRight>
				<FromRight delay={4}>
					<R2 />
				</FromRight>
				<FromRight delay={5}>
					<D />
				</FromRight>
				<FromRight delay={6}>
					<E2 />
				</FromRight>
				<FromRight delay={7}>
					<R3 />
				</FromRight>
				<AbsoluteFill
					style={{
						width: '160%',
						height: '100.2%',
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
