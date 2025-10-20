import {useMemo} from 'react';

const baseStyle: React.CSSProperties = {
	width: 12,
	height: 12,
};

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const ResizeHandle: React.FC<{readonly position: Position}> = ({
	position,
}) => {
	const style: React.CSSProperties = useMemo(() => {
		if (position === 'top-left') {
			return {
				...baseStyle,
				top: 0,
				left: 0,
				marginLeft: -3,
				marginTop: -3,
				cursor: 'nwse-resize',
			};
		}

		if (position === 'top-right') {
			return {
				...baseStyle,
				top: 0,
				right: 0,
				marginRight: -3,
				marginTop: -3,
				cursor: 'nesw-resize',
			};
		}

		if (position === 'bottom-left') {
			return {
				...baseStyle,
				bottom: 0,
				left: 0,
				marginLeft: -3,
				marginBottom: -3,
				cursor: 'nesw-resize',
			};
		}

		if (position === 'bottom-right') {
			return {
				...baseStyle,
				bottom: 0,
				right: 0,
				marginRight: -3,
				marginBottom: -3,
				cursor: 'nwse-resize',
			};
		}

		throw new Error('Unknown position: ' + JSON.stringify(position));
	}, [position]);

	return (
		<div
			className="w-3 h-3 bg-white absolute rounded-full border-2 border-black"
			style={style}
		/>
	);
};
