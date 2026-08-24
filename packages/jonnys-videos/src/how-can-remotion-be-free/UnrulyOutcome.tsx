import React from 'react';
import {AbsoluteFill, Interactive} from 'remotion';

export const UNRULY_OUTCOME_DURATION_IN_FRAMES = 81;

const OUTCOMES = [
	'bait and switch',
	'sell to highest bidder',
	'acquihire by big tech',
	'become a cloud',
	'go broke',
] as const;

const OutcomeRow: React.FC<{item: string; index: number}> = ({item, index}) => {
	return (
		<Interactive.Div
			name={`Outcome ${index + 1}: ${item}`}
			style={{
				alignItems: 'center',
				display: 'flex',
				height: 126,
				padding: '0 24px 18px 18px',
				position: 'relative',
				rotate: `${[-1.1, 0.45, -0.35, 0.8, -0.65][index]}deg`,
			}}
		>
			<svg
				viewBox="0 0 960 32"
				preserveAspectRatio="none"
				style={{
					bottom: 0,
					height: 32,
					left: 0,
					overflow: 'visible',
					position: 'absolute',
					width: '100%',
				}}
			>
				<path
					d="M4 18 C150 8 302 26 456 17 C620 8 785 23 956 14"
					fill="none"
					stroke="rgba(113, 165, 255, 0.62)"
					strokeLinecap="round"
					strokeWidth="3.5"
				/>
				<path
					d="M10 24 C190 19 338 29 500 23 C684 17 824 28 948 21"
					fill="none"
					stroke="rgba(113, 165, 255, 0.2)"
					strokeLinecap="round"
					strokeWidth="2"
				/>
			</svg>
			<div
				style={{
					alignItems: 'center',
					border: '4px solid #ff563d',
					borderRadius: '51% 44% 53% 46%',
					color: '#ff674f',
					display: 'flex',
					flex: '0 0 68px',
					fontFamily:
						"Noteworthy, 'Bradley Hand', 'Marker Felt', 'Comic Sans MS', cursive",
					fontSize: 43,
					fontWeight: 700,
					height: 68,
					justifyContent: 'center',
					lineHeight: 1,
					marginRight: 30,
					rotate: `${[-5, 4, -3, 5, -4][index]}deg`,
				}}
			>
				{index + 1}
			</div>
			<div
				style={{
					color: '#f5f0dc',
					fontFamily:
						"Noteworthy, 'Bradley Hand', 'Marker Felt', 'Comic Sans MS', cursive",
					fontSize: 64,
					fontWeight: 700,
					letterSpacing: 0.4,
					lineHeight: 1,
					textShadow: '0 3px 0 rgba(0, 0, 0, 0.3)',
				}}
			>
				{item}
			</div>
		</Interactive.Div>
	);
};

export const UnrulyOutcome: React.FC = () => {
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 12,
					left: 58,
					position: 'absolute',
					right: 58,
					top: 135,
				}}
			>
				{OUTCOMES.map((item, index) => (
					<OutcomeRow key={item} item={item} index={index} />
				))}
			</div>
		</AbsoluteFill>
	);
};
