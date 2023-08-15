import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {INPUT_BACKGROUND} from '../../helpers/colors';
import {useZIndex} from '../../state/z-index';
import type {RemInputStatus} from './RemInput';
import {getInputBorderColor} from './RemInput';

type Props = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
> & {
	status: RemInputStatus;
	name: string;
};

const inputBaseStyle: React.CSSProperties = {
	padding: 0,
	borderStyle: 'solid',
	borderWidth: 1,
};

const RemInputTypeColorForwardRef: React.ForwardRefRenderFunction<
	HTMLInputElement,
	Props
> = ({status, ...props}, ref) => {
	const [isFocused, setIsFocused] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const {tabIndex} = useZIndex();

	const style = useMemo(() => {
		return {
			backgroundColor: INPUT_BACKGROUND,
			...inputBaseStyle,
			borderColor: getInputBorderColor({isFocused, isHovered, status}),
			...(props.style ?? {}),
		};
	}, [isFocused, isHovered, props.style, status]);

	useImperativeHandle(
		ref,
		() => {
			return inputRef.current as HTMLInputElement;
		},
		[]
	);

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

	return (
		<input
			ref={inputRef}
			type="color"
			tabIndex={tabIndex}
			{...props}
			name={props.name}
			style={style}
		/>
	);
};

export const RemInputTypeColor = forwardRef(RemInputTypeColorForwardRef);
