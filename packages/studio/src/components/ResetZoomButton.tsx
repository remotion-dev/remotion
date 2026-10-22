import React, {useCallback} from 'react';
import {BLACK_ALPHA_60, INPUT_BACKGROUND, WHITE} from '../helpers/colors';

const button: React.CSSProperties = {
	appearance: 'none',
	backgroundColor: INPUT_BACKGROUND,
	border: `1px solid ${BLACK_ALPHA_60}`,
	borderRadius: 4,
	color: WHITE,
	flexDirection: 'row',
	fontFamily: 'inherit',
	fontSize: 14,
};

const buttonContainer: React.CSSProperties = {
	cursor: 'pointer',
	fontSize: 14,
	padding: 10,
};

export const ResetZoomButton: React.FC<{
	readonly onClick: () => void;
}> = ({onClick}) => {
	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			event.stopPropagation();
		},
		[],
	);

	return (
		<button
			style={button}
			type="button"
			onClick={onClick}
			onPointerDown={onPointerDown}
		>
			<div className="css-reset" style={buttonContainer}>
				Reset zoom
			</div>
		</button>
	);
};
