import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
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
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const style = useMemo(() => {
		return {
			backgroundColor: 'rgba(255, 255, 255, 0.05)',
			border: BORDER_COLOR,
			fontFamily: FONT_FAMILY,
			padding: '10px 10px',
			color: 'white',
			outline: 'none',
			borderStyle: 'solid',
			borderWidth: 1,
			borderRadius: 5,
			borderColor: isFocused ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
			...(props.style ?? {}),
		};
	}, [isFocused, props.style]);

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

		current.addEventListener('focus', onFocus);
		current.addEventListener('blur', onBlur);

		return () => {
			current.removeEventListener('focus', onFocus);
			current.removeEventListener('blur', onBlur);
		};
	}, [inputRef]);

	return <input ref={inputRef} {...props} style={style} />;
};

export const RemotionInput = forwardRef(RemInputForwardRef);
