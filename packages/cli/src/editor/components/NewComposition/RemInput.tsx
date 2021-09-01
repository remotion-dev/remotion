import React, {forwardRef, useMemo} from 'react';
import {BORDER_COLOR} from '../../helpers/colors';
import {FONT_FAMILY} from '../../helpers/font';

type Props = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>;

const RemInputForwardRef: React.ForwardRefRenderFunction<
	HTMLInputElement,
	Props
> = (props, ref) => {
	const style = useMemo(() => {
		return {
			backgroundColor: 'rgba(255, 255, 255, 0.2)',
			border: BORDER_COLOR,
			fontFamily: FONT_FAMILY,
			padding: '14px 14px',
			color: 'white',
			...(props.style ?? {}),
		};
	}, [props.style]);

	return <input ref={ref} {...props} style={style} />;
};

export const RemotionInput = forwardRef(RemInputForwardRef);
