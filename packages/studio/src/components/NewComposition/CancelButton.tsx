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
		<svg viewBox="0 0 640 640" {...props}>
			<path
				fill={CURRENT_COLOR}
				d="M507.3 155.3C513.5 149.1 513.5 138.9 507.3 132.7C501.1 126.5 490.9 126.5 484.7 132.7L320 297.4L155.3 132.7C149.1 126.5 138.9 126.5 132.7 132.7C126.5 138.9 126.5 149.1 132.7 155.3L297.4 320L132.7 484.7C126.5 490.9 126.5 501.1 132.7 507.3C138.9 513.5 149.1 513.5 155.3 507.3L320 342.6L484.7 507.3C490.9 513.5 501.1 513.5 507.3 507.3C513.5 501.1 513.5 490.9 507.3 484.7L342.6 320L507.3 155.3z"
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
