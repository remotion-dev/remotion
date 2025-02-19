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
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {
	INPUT_HORIZONTAL_PADDING,
	getInputBorderColor,
} from '../NewComposition/RemInput';

type Props = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLTextAreaElement>,
	HTMLTextAreaElement
> & {
	readonly status: 'error' | 'warning' | 'ok';
};

const inputBaseStyle: React.CSSProperties = {
	padding: `${INPUT_HORIZONTAL_PADDING}px 10px`,
	color: 'white',
	borderStyle: 'solid',
	borderWidth: 1,
	fontSize: 14,
	resize: 'none',
	overflowX: 'hidden',
};

const RemTextareaFRFunction: React.ForwardRefRenderFunction<
	HTMLTextAreaElement,
	Props
> = ({status, ...props}, ref) => {
	const [isFocused, setIsFocused] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const {tabIndex} = useZIndex();

	useImperativeHandle(ref, () => {
		return inputRef.current as HTMLTextAreaElement;
	}, []);

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
		const onKeyDown = (e: KeyboardEvent) => {
			if (!inputRef.current) {
				return;
			}

			if (inputRef.current !== document.activeElement) {
				return;
			}

			if (e.code === 'Tab') {
				e.preventDefault();
				// Always match up with value in JSON.stringify(content, null, 2)
				document.execCommand('insertText', false, ' '.repeat(2));
			}

			if (e.code === 'Enter') {
				e.preventDefault();
				const {selectionStart, selectionEnd, value} = inputRef.current;
				if (selectionStart !== selectionEnd) {
					return;
				}

				let prevNewline = selectionStart;
				for (let i = selectionStart - 1; i >= 0; i--) {
					if (value[i] === '\n') {
						break;
					}

					prevNewline = i;
				}

				const currentLine = value.substring(prevNewline, selectionStart);
				const trimmed = currentLine.trim();
				const difference = currentLine.length - trimmed.length;
				document.execCommand(
					'insertText',
					false,
					'\n' + ' '.repeat(difference),
				);
			}
		};

		current.addEventListener('focus', onFocus);
		current.addEventListener('blur', onBlur);
		current.addEventListener('mouseenter', onMouseEnter);
		current.addEventListener('mouseleave', onMouseLeave);
		current.addEventListener('keydown', onKeyDown);

		return () => {
			current.removeEventListener('focus', onFocus);
			current.removeEventListener('blur', onBlur);
			current.removeEventListener('mouseenter', onMouseEnter);
			current.removeEventListener('mouseleave', onMouseLeave);
			current.removeEventListener('keydown', onKeyDown);
		};
	}, [inputRef]);

	return (
		<textarea
			ref={inputRef}
			tabIndex={tabIndex}
			{...props}
			className={VERTICAL_SCROLLBAR_CLASSNAME}
			style={style}
		/>
	);
};

export const RemTextarea = forwardRef(RemTextareaFRFunction);
