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
import {
	getInputBorderColor,
	INPUT_HORIZONTAL_PADDING,
} from '../NewComposition/RemInput';

type Props = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLTextAreaElement>,
	HTMLTextAreaElement
> & {
	status: 'error' | 'warning' | 'ok';
};

export const inputBaseStyle: React.CSSProperties = {
	padding: `${INPUT_HORIZONTAL_PADDING}px 10px`,
	color: 'white',
	borderStyle: 'solid',
	borderWidth: 1,
	fontSize: 14,
	resize: 'vertical',
};

// TODO: Should be able to hit "Tab"
const RemTextareaFRFunction: React.ForwardRefRenderFunction<
	HTMLTextAreaElement,
	Props
> = ({status, ...props}, ref) => {
	const [isFocused, setIsFocused] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const {tabIndex} = useZIndex();

	useImperativeHandle(
		ref,
		() => {
			return inputRef.current as HTMLTextAreaElement;
		},
		[]
	);

	const style = useMemo(() => {
		return {
			backgroundColor: INPUT_BACKGROUND,
			...inputBaseStyle,
			width: '100%',
			borderColor: getInputBorderColor({isFocused, isHovered, status}),
			...(props.style ?? {}),
		};
	}, [isFocused, isHovered, props.style, status]);

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
		<textarea ref={inputRef} tabIndex={tabIndex} {...props} style={style} />
	);
};

export const RemTextarea = forwardRef(RemTextareaFRFunction);
