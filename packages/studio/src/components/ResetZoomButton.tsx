import React, {useCallback} from 'react';
import {Button} from './Button';

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
		<Button onClick={onClick} onPointerDown={onPointerDown}>
			Reset zoom
		</Button>
	);
};
