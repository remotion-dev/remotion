import type {PropsWithChildren} from 'react';
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	FAIL_COLOR,
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_HOVERED,
	INPUT_BORDER_COLOR_UNHOVERED,
	SELECTED_BACKGROUND,
	WARNING_COLOR,
} from '../../helpers/colors';
import {useZIndex} from '../../state/z-index';

export type RemInputStatus = 'error' | 'warning' | 'ok';

type Props = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
> & {
	readonly status: RemInputStatus;
	readonly rightAlign: boolean;
};

export const INPUT_HORIZONTAL_PADDING = 8;

const aligner: React.CSSProperties = {
	marginRight: -INPUT_HORIZONTAL_PADDING,
};

export const RightAlignInput: React.FC<PropsWithChildren> = ({children}) => {
	return <div style={aligner}>{children}</div>;
};

export const inputBaseStyle: React.CSSProperties = {
	padding: `${INPUT_HORIZONTAL_PADDING}px 10px`,
	color: 'white',
	borderStyle: 'solid',
	borderWidth: 1,
	fontSize: 14,
};

export const getInputBorderColor = ({
	status,
	isFocused,
	isHovered,
}: {
	status: 'error' | 'warning' | 'ok';
	isFocused: boolean;
	isHovered: boolean;
}) =>
	status === 'warning'
		? WARNING_COLOR
		: status === 'error'
			? FAIL_COLOR
			: isFocused
				? SELECTED_BACKGROUND
				: isHovered
					? INPUT_BORDER_COLOR_HOVERED
					: INPUT_BORDER_COLOR_UNHOVERED;

const RemInputForwardRef: React.ForwardRefRenderFunction<
	HTMLInputElement,
	Props
> = ({status, rightAlign, ...props}, ref) => {
	const [isFocused, setIsFocused] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const {tabIndex} = useZIndex();

	const style = useMemo((): React.CSSProperties => {
		return {
			backgroundColor: INPUT_BACKGROUND,
			...inputBaseStyle,
			width: '100%',
			borderColor: getInputBorderColor({isFocused, isHovered, status}),
			textAlign: rightAlign ? 'right' : 'left',
			...(props.style ?? {}),
		};
	}, [isFocused, isHovered, rightAlign, props.style, status]);

	useImperativeHandle(ref, () => {
		return inputRef.current as HTMLInputElement;
	}, []);

	useEffect(() => {
		if (!inputRef.current) {
			return;
		}

		const {current} = inputRef;

		const onFocus = () => setIsFocused(true);
		const onBlur = () => setIsFocused(false);
		const onMouseEnter = () => setIsHovered(true);
		const onMouseLeave = () => setIsHovered(false);

		current.addEventListener('focus', onFocus);
		current.addEventListener('blur', onBlur);
		current.addEventListener('mouseenter', onMouseEnter);
		current.addEventListener('mouseleave', onMouseLeave);

		return () => {
			current.removeEventListener('focus', onFocus);
			current.removeEventListener('blur', onBlur);
			current.removeEventListener('mouseenter', onMouseEnter);
			current.removeEventListener('mouseleave', onMouseLeave);
		};
	}, [inputRef]);

	return <input ref={inputRef} tabIndex={tabIndex} {...props} style={style} />;
};

export const RemotionInput = forwardRef(RemInputForwardRef);
