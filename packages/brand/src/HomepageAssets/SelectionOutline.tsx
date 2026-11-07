import {Interactive} from 'remotion';

// Bounds, handles, and strokes are all expressed in final composition pixels.
export const SelectionOutline = ({
	canvasSize,
	bounds,
	handleSize,
	strokeWidth,
}: {
	readonly canvasSize: {width: number; height: number};
	readonly bounds: {left: number; top: number; width: number; height: number};
	readonly handleSize: number;
	readonly strokeWidth: number;
}) => {
	if (bounds.width <= 0 || bounds.height <= 0) {
		return null;
	}

	const handleOffset = handleSize / 2;

	return (
		<Interactive.Svg
			viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: '100%',
				height: '100%',
				overflow: 'visible',
			}}
		>
			<Interactive.Rect
				fill="none"
				x={bounds.left}
				y={bounds.top}
				width={bounds.width}
				height={bounds.height}
				stroke="#0d99ff"
				strokeWidth={strokeWidth}
			/>
			<Interactive.Rect
				fill="white"
				x={bounds.left - handleOffset}
				y={bounds.top - handleOffset}
				width={handleSize}
				height={handleSize}
				stroke="#0d99ff"
				strokeWidth={strokeWidth}
			/>
			<Interactive.Rect
				fill="white"
				x={bounds.left + bounds.width - handleOffset}
				y={bounds.top - handleOffset}
				width={handleSize}
				height={handleSize}
				stroke="#0d99ff"
				strokeWidth={strokeWidth}
			/>
			<Interactive.Rect
				fill="white"
				x={bounds.left - handleOffset}
				y={bounds.top + bounds.height - handleOffset}
				width={handleSize}
				height={handleSize}
				stroke="#0d99ff"
				strokeWidth={strokeWidth}
			/>
			<Interactive.Rect
				fill="white"
				x={bounds.left + bounds.width - handleOffset}
				y={bounds.top + bounds.height - handleOffset}
				width={handleSize}
				height={handleSize}
				stroke="#0d99ff"
				strokeWidth={strokeWidth}
			/>
		</Interactive.Svg>
	);
};
