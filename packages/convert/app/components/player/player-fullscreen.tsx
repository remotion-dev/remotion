const fullscreenIconSize = 20;

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
				stroke="#000"
				strokeWidth={strokeWidth}
				fill="none"
			/>
			<path
				d={`
				M ${viewSize - out} ${inset}
				L ${viewSize - middleInset} ${middleInset}
				L ${viewSize - inset} ${out}
				`}
				stroke="#000"
				strokeWidth={strokeWidth}
				fill="none"
			/>
			<path
				d={`
				M ${out} ${viewSize - inset}
				L ${middleInset} ${viewSize - middleInset}
				L ${inset} ${viewSize - out}
				`}
				stroke="#000"
				strokeWidth={strokeWidth}
				fill="none"
			/>
			<path
				d={`
				M ${viewSize - out} ${viewSize - inset}
				L ${viewSize - middleInset} ${viewSize - middleInset}
				L ${viewSize - inset} ${viewSize - out}
				`}
				stroke="#000"
				strokeWidth={strokeWidth}
				fill="none"
			/>
		</svg>
	);
};

export const PlayerFullscreen: React.FC<{
	isFullscreen: boolean;
	onClick: () => void;
}> = ({isFullscreen, onClick}) => {
	return (
		<button
			type="button"
			className="pl-4 pr-4 cursor-pointer"
			onClick={onClick}
			aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
		>
			<FullscreenIcon isFullscreen={isFullscreen} />
		</button>
	);
};
