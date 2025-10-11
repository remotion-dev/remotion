import React, {useMemo} from 'react';
import {useZIndex} from '../state/z-index';

export const CONTROL_BUTTON_PADDING = 6;

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
			background: 'none',
			border: 'none',
			padding: CONTROL_BUTTON_PADDING,
		};
	}, [props.disabled]);

	const {tabIndex} = useZIndex();
	return (
		<button type={'button'} tabIndex={tabIndex} {...props} style={style} />
	);
};
