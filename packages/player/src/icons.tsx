import React from 'react';

const size = 25;

const rotate: React.CSSProperties = {
	transform: `rotate(90deg)`,
};

export const PlayIcon: React.FC = () => {
	return (
		<svg width={size} height={size} viewBox="-100 -100 400 400" style={rotate}>
			<g stroke="#fff" strokeWidth="100" strokeLinejoin="round">
				<path
					fill="#fff"
					d="M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
				/>
			</g>
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

export const FullscreenIcon: React.FC = () => {
	return (
		<svg height={size} viewBox="0 0 24 24" width={size}>
			<path d="M0 0h24v24H0z" fill="none" />
			<path
				d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
				fill="#fff"
			/>
		</svg>
	);
};

export const FullscreenExitIcon: React.FC = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			height={size}
			width={size}
			viewBox="0 0 24 24"
		>
			<path fill="none" d="M0 0h24v24H0z" />
			<path
				d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
				fill="#fff"
			/>
		</svg>
	);
};
