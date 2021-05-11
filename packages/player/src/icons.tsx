import React from 'react';

const size = 25;
const fullscreenIconSize = 16;

const rotate: React.CSSProperties = {
	transform: `rotate(90deg)`,
};

export const PlayIcon: React.FC = () => {
	return (
		<svg width={size} height={size} viewBox="-100 -100 400 400" style={rotate}>
			<path
				fill="#fff"
				stroke="#fff"
				strokeWidth="100"
				strokeLinejoin="round"
				d="M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
			/>
		</svg>
	);
};

export const PauseIcon: React.FC = () => {
	return (
		<svg viewBox="0 0 100 100" width={size} height={size}>
			<rect x="25" y="20" width="20" height="60" fill="#fff" ry="5" rx="5" />
			<rect x="55" y="20" width="20" height="60" fill="#fff" ry="5" rx="5" />
		</svg>
	);
};

export const FullscreenIcon: React.FC<{minimized: boolean}> = ({minimized}) => {
	const strokeWidth = 6;
	const viewSize = 32;

	const out = minimized ? strokeWidth / 2 : 0;
	const middleInset = minimized ? strokeWidth / 2 : strokeWidth * 1.6;
	const inset = minimized ? strokeWidth * 2 : strokeWidth * 1.6;

	return (
		<svg
			viewBox={`0 0 ${viewSize} ${viewSize}`}
			height={fullscreenIconSize}
			width={fullscreenIconSize}
		>
			<path
				d={`
				M ${out} ${inset}
				L ${middleInset} ${middleInset}
				L ${inset} ${out}
				`}
				stroke="#fff"
				strokeWidth={strokeWidth}
				fill="none"
			/>
			<path
				d={`
				M ${viewSize - out} ${inset}
				L ${viewSize - middleInset} ${middleInset}
				L ${viewSize - inset} ${out}
				`}
				stroke="#fff"
				strokeWidth={strokeWidth}
				fill="none"
			/>
			<path
				d={`
				M ${out} ${viewSize - inset}
				L ${middleInset} ${viewSize - middleInset}
				L ${inset} ${viewSize - out}
				`}
				stroke="#fff"
				strokeWidth={strokeWidth}
				fill="none"
			/>
			<path
				d={`
				M ${viewSize - out} ${viewSize - inset}
				L ${viewSize - middleInset} ${viewSize - middleInset}
				L ${viewSize - inset} ${viewSize - out}
				`}
				stroke="#fff"
				strokeWidth={strokeWidth}
				fill="none"
			/>
		</svg>
	);
};
