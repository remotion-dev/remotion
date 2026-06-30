import React from 'react';

export const ICON_SIZE = 25;
export const fullscreenIconSize = 16;
const focusRingFallbackColor = 'Highlight';
const focusRingColor = '-webkit-focus-ring-color';
const focusRingStyle: React.CSSProperties = {
	stroke: focusRingColor,
};

const playPath =
	'M8 6.375C7.40904 8.17576 7.06921 10.2486 7.01438 12.3871C6.95955 14.5255 7.19163 16.6547 7.6875 18.5625C9.95364 18.2995 12.116 17.6164 14.009 16.5655C15.902 15.5147 17.4755 14.124 18.6088 12.5C17.5158 10.8949 15.9949 9.51103 14.1585 8.45082C12.3222 7.3906 10.2174 6.68116 8 6.375Z';

const playFocusPath =
	'M93.4691 0.0367432C84.4873 0.520935 77.2494 1.93634 69.9553 4.69266C66.3176 6.05219 60.3548 9.0134 57.0734 11.062C43.3476 19.6103 32.8846 32.4606 27.428 47.4154C26.3405 50.3766 23.3966 59.8188 21.5027 66.3185C8.88329 109.768 1.7204 157.277 0.182822 207.561C-0.0609408 215.569 -0.0609408 234.639 0.182822 242.517C1.21413 275.854 4.42055 305.949 10.2334 336.641C12.596 349.063 16.3837 365.75 18.5776 373.33C23.059 388.732 32.2095 401.843 45.2227 411.453C53.9419 417.896 63.8425 422.217 74.8118 424.34C80.0996 425.365 87.075 425.83 92.2127 425.495C99.3194 425.029 113.42 423.148 124.877 421.118C176.517 411.974 224.22 395.604 267.478 372.175C294.874 357.332 318.294 341.26 340.888 321.761C363.408 302.355 382.609 281.478 399.504 258.049C403.423 252.63 405.392 249.464 407.361 245.478C412.424 235.198 414.805 224.974 414.786 213.539C414.786 202.886 412.761 193.425 408.392 183.741C406.292 179.066 404.286 175.714 399.785 169.345C383.21 145.898 364.815 125.467 342.389 105.614C307.624 74.8481 266.335 49.613 220.226 30.9334C210.232 26.8921 200.387 23.335 188.537 19.4799C163.448 11.3413 132.396 4.28293 106.126 0.763062C102.001 0.204346 96.3942 -0.112244 93.4691 0.0367432Z';

type Bounds = {
	readonly x1: number;
	readonly y1: number;
	readonly x2: number;
	readonly y2: number;
};

const playIconStrokeWidth = 6.25;
const playFocusStrokeWidth = 1.5;
const playFocusPadding = 2;

// Derived with @remotion/paths getBoundingBox() from the paths above.
const playPathBounds: Bounds = {
	x1: 7.006500987565134,
	y1: 6.375,
	x2: 18.6088,
	y2: 18.5625,
};

const playFocusPathBounds: Bounds = {
	x1: -9.999999999649709e-8,
	y1: 0.000013203698169792638,
	x2: 414.7861127950162,
	y2: 425.60252460486765,
};

const expandBounds = (bounds: Bounds, padding: number): Bounds => {
	return {
		x1: bounds.x1 - padding,
		y1: bounds.y1 - padding,
		x2: bounds.x2 + padding,
		y2: bounds.y2 + padding,
	};
};

const getBoundsWidth = (bounds: Bounds) => bounds.x2 - bounds.x1;
const getBoundsHeight = (bounds: Bounds) => bounds.y2 - bounds.y1;

const fitBoundsTransform = ({
	source,
	target,
}: {
	readonly source: Bounds;
	readonly target: Bounds;
}) => {
	const scale = Math.min(
		getBoundsWidth(target) / getBoundsWidth(source),
		getBoundsHeight(target) / getBoundsHeight(source),
	);
	const x =
		target.x1 +
		(getBoundsWidth(target) - getBoundsWidth(source) * scale) / 2 -
		source.x1 * scale;
	const y =
		target.y1 +
		(getBoundsHeight(target) - getBoundsHeight(source) * scale) / 2 -
		source.y1 * scale;

	return `translate(${x.toFixed(4)} ${y.toFixed(4)}) scale(${scale.toFixed(
		5,
	)})`;
};

const playFocusTransform = fitBoundsTransform({
	source: playFocusPathBounds,
	target: expandBounds(
		expandBounds(playPathBounds, playIconStrokeWidth / 2),
		playFocusPadding,
	),
});

export const PlayIcon: React.FC<{readonly focused?: boolean}> = ({focused}) => {
	return (
		<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 25 25" fill="none">
			{focused ? (
				<path
					d={playFocusPath}
					fill="none"
					stroke={focusRingFallbackColor}
					strokeWidth={playFocusStrokeWidth}
					style={focusRingStyle}
					transform={playFocusTransform}
					vectorEffect="non-scaling-stroke"
				/>
			) : null}
			<path
				d={playPath}
				fill="white"
				stroke="white"
				strokeWidth={playIconStrokeWidth}
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export const PauseIcon: React.FC<{readonly focused?: boolean}> = ({
	focused,
}) => {
	return (
		<svg viewBox="0 0 100 100" width={ICON_SIZE} height={ICON_SIZE}>
			{focused ? (
				<>
					<rect
						x="21"
						y="16"
						width="28"
						height="68"
						fill="none"
						stroke={focusRingFallbackColor}
						strokeWidth="4"
						ry="9"
						rx="9"
						style={focusRingStyle}
					/>
					<rect
						x="51"
						y="16"
						width="28"
						height="68"
						fill="none"
						stroke={focusRingFallbackColor}
						strokeWidth="4"
						ry="9"
						rx="9"
						style={focusRingStyle}
					/>
				</>
			) : null}
			<rect x="25" y="20" width="20" height="60" fill="#fff" ry="5" rx="5" />
			<rect x="55" y="20" width="20" height="60" fill="#fff" ry="5" rx="5" />
		</svg>
	);
};

export const FullscreenIcon: React.FC<{readonly isFullscreen: boolean}> = ({
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
