import type {SVGProps} from 'react';
import React from 'react';
import {CURRENT_COLOR, TRANSPARENT, WHITE} from '../../helpers/colors';
import {useZIndex} from '../../state/z-index';

const style: React.CSSProperties = {
	appearance: 'none',
	border: 'none',
	backgroundColor: TRANSPARENT,
	color: WHITE,
	cursor: 'pointer',
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
};

export const CancelIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg viewBox="0 0 320 512" {...props}>
			<path
				fill={CURRENT_COLOR}
				d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"
			/>
		</svg>
	);
};

export const CancelButton: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly onPress: () => void;
	}
> = ({onPress, ...props}) => {
	const {tabIndex} = useZIndex();
	return (
		<button tabIndex={tabIndex} style={style} type="button" onClick={onPress}>
			<CancelIcon {...props} />
		</button>
	);
};
