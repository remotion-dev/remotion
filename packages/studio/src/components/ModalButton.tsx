import React, {useMemo} from 'react';
import {BLUE, BLUE_DISABLED} from '../helpers/colors';
import type {ButtonProps} from './Button';
import {Button} from './Button';

const buttonStyle: React.CSSProperties = {
	backgroundColor: BLUE,
	color: 'white',
};

export const ModalButton: React.FC<Omit<ButtonProps, 'style'>> = (props) => {
	const style = useMemo(() => {
		return {
			...buttonStyle,
			backgroundColor: props.disabled ? BLUE_DISABLED : BLUE,
		};
	}, [props.disabled]);

	return <Button {...props} style={style} />;
};
