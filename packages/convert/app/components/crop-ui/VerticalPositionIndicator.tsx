const INDICATOR_WIDTH = 100;
const INDICATOR_HEIGHT = 100;

export const VerticalPositionIndicator: React.FC<{
	xPosition: number;
	width: number;
	isDragging: boolean;
}> = ({xPosition, width, isDragging}) => {
	return (
		<div
			className="absolute font-brand text-sm text-gray-500 transition-opacity"
			style={{
				left: `${(xPosition / width) * 100}%`,
				top: -25,
				marginLeft: -INDICATOR_WIDTH / 2,
				width: INDICATOR_WIDTH,
				textAlign: 'center',
				height: 25,
				opacity: Number(isDragging && xPosition !== 0 && width !== xPosition),
			}}
		>
			{xPosition}
		</div>
	);
};

export const HorizontalPositionIndicator: React.FC<{
	yPosition: number;
	height: number;
	isDragging: boolean;
}> = ({yPosition, height, isDragging}) => {
	return (
		<div
			className="absolute font-brand text-sm text-gray-500 pr-2 transition-opacity"
			style={{
				top: `${(yPosition / height) * 100}%`,
				left: -INDICATOR_HEIGHT,
				marginTop: -INDICATOR_HEIGHT / 2,
				width: INDICATOR_WIDTH,
				textAlign: 'right',
				height: INDICATOR_HEIGHT,
				lineHeight: `${INDICATOR_HEIGHT}px`,
				pointerEvents: 'none',
				opacity: Number(isDragging && yPosition !== 0 && height !== yPosition),
			}}
		>
			{yPosition}
		</div>
	);
};
