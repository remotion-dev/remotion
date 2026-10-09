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
	BLACK_ALPHA_60,
	FAIL_COLOR,
	INPUT_BACKGROUND,
	SELECTED_BACKGROUND,
	WARNING_COLOR,
	WHITE,
} from '../../helpers/colors';
import {INPUT_HOVER_CLASS_NAME} from '../../helpers/hoverable';
import {useZIndex} from '../../state/z-index';

export type RemInputStatus = 'error' | 'warning' | 'ok';

type Props = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
> & {
	readonly status: RemInputStatus;
	readonly rightAlign: boolean;
	readonly small?: boolean;
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
	color: WHITE,
	borderStyle: 'solid',
	borderWidth: 1,
	fontSize: 14,
};

const compactInputStyle: React.CSSProperties = {
	fontSize: 12,
	lineHeight: '16px',
	padding: '4px 6px',
};

export const getInputBorderColor = ({
	status,
	isFocused,
}: {
	status: 'error' | 'warning' | 'ok';
	isFocused: boolean;
}) =>
	status === 'warning'
		? WARNING_COLOR
		: status === 'error'
			? FAIL_COLOR
			: isFocused
				? SELECTED_BACKGROUND
				: `var(--remotion-studio-input-hover-border, ${BLACK_ALPHA_60})`;

const RemInputForwardRef: React.ForwardRefRenderFunction<
	HTMLInputElement,
	Props
> = ({status, rightAlign, small = false, ...props}, ref) => {
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const {tabIndex} = useZIndex();

	const style = useMemo((): React.CSSProperties => {
		return {
			backgroundColor: INPUT_BACKGROUND,
			...inputBaseStyle,
			...(small ? compactInputStyle : null),
			width: '100%',
			borderColor: getInputBorderColor({isFocused, status}),
			textAlign: rightAlign ? 'right' : 'left',
			...(props.style ?? {}),
		};
	}, [isFocused, rightAlign, props.style, small, status]);

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

		current.addEventListener('focus', onFocus);
		current.addEventListener('blur', onBlur);

		return () => {
			current.removeEventListener('focus', onFocus);
			current.removeEventListener('blur', onBlur);
		};
	}, [inputRef]);

	return (
		<input
			ref={inputRef}
			tabIndex={tabIndex}
			{...props}
			className={`${INPUT_HOVER_CLASS_NAME} ${props.className ?? ''}`}
			style={style}
		/>
	);
};

export const RemotionInput = forwardRef(RemInputForwardRef);
