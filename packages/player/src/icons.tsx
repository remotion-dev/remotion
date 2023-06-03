import React from 'react';

export const ICON_SIZE = 25;
export const fullscreenIconSize = 16;

const rotate: React.CSSProperties = {
	transform: `rotate(90deg)`,
};

export const PlayIcon: React.FC = () => {
	return (
		<svg
			width={ICON_SIZE}
			height={ICON_SIZE}
			viewBox="-100 -100 400 400"
			style={rotate}
		>
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
		<svg viewBox="0 0 100 100" width={ICON_SIZE} height={ICON_SIZE}>
			<rect x="25" y="20" width="20" height="60" fill="#fff" ry="5" rx="5" />
			<rect x="55" y="20" width="20" height="60" fill="#fff" ry="5" rx="5" />
		</svg>
	);
};

export const FullscreenIcon: React.FC<{isFullscreen: boolean}> = ({
	isFullscreen,
}) => {
	const strokeWidth = 6;
	const viewSize = 32;

	const out = isFullscreen ? 0 : strokeWidth / 2;
	const middleInset = isFullscreen ? strokeWidth * 1.6 : strokeWidth / 2;
	const inset = isFullscreen ? strokeWidth * 1.6 : strokeWidth * 2;

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

export const VolumeOffIcon: React.FC = () => {
	return (
		<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
			<path
				d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"
				fill="#fff"
			/>
		</svg>
	);
};

export const VolumeOnIcon: React.FC = () => {
	return (
		<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
			<path
				d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z"
				fill="#fff"
			/>
		</svg>
	);
};

export const SettingsIcon: React.FC<{iconSize?: number}> = ({iconSize}) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			height={iconSize ?? ICON_SIZE}
			viewBox="0 0 512 512"
			style={{fill: '#fff'}}
		>
			<path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
		</svg>
	);
};
