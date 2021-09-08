import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	BORDER_COLOR,
	CLEAR_HOVER,
	SELECTED_BACKGROUND,
} from '../../helpers/colors';
import {FONT_FAMILY} from '../../helpers/font';
import {useZIndex} from '../../state/z-index';

type Props = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>;

const RemInputForwardRef: React.ForwardRefRenderFunction<
	HTMLInputElement,
	Props
> = (props, ref) => {
	const [isFocused, setIsFocused] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const {tabIndex} = useZIndex();

	const style = useMemo(() => {
		return {
			backgroundColor: 'rgba(255, 255, 255, 0.06)',
			border: BORDER_COLOR,
			fontFamily: FONT_FAMILY,
			padding: '10px 16px',
			color: 'white',
			outline: 'none',
			borderStyle: 'solid',
			borderWidth: 2,
			borderRadius: 5,
			fontSize: 15,
			borderColor: isFocused
				? SELECTED_BACKGROUND
				: isHovered
				? CLEAR_HOVER
				: 'transparent',
			...(props.style ?? {}),
		};
	}, [isFocused, isHovered, props.style]);

	useImperativeHandle(ref, () => {
		return inputRef.current as HTMLInputElement;
	});

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
