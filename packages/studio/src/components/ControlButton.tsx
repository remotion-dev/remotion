import React, {useMemo} from 'react';
import {useZIndex} from '../state/z-index';

export const CONTROL_BUTTON_PADDING = 6;
export const CONTROL_BUTTON_SIZE = 30;

export const ControlButton = (
	props: React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> & {
		readonly title: string;
	},
) => {
	const style = useMemo((): React.CSSProperties => {
		return {
			opacity: props.disabled ? 0.5 : 1,
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: CONTROL_BUTTON_SIZE,
			height: CONTROL_BUTTON_SIZE,
			background: 'none',
			border: 'none',
			padding: 0,
		};
	}, [props.disabled]);

	const {tabIndex} = useZIndex();
	return (
		<button type={'button'} tabIndex={tabIndex} {...props} style={style} />
	);
};
