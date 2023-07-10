import type {InputHTMLAttributes, MouseEventHandler} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BLUE} from '../../helpers/colors';
import {noop} from '../../helpers/noop';
import {getClickLock} from '../../state/input-dragger-click-lock';
import {HigherZIndex} from '../../state/z-index';
import type {RemInputStatus} from './RemInput';
import {inputBaseStyle, RemotionInput} from './RemInput';

type Props = InputHTMLAttributes<HTMLInputElement> & {
	onValueChange: (newVal: number) => void;
	onTextChange: (newVal: string) => void;
	status: RemInputStatus;
	formatter?: (str: number | string) => string;
	rightAlign: boolean;
};

const isInt = (num: number) => {
	return num % 1 === 0;
};

export const InputDragger: React.FC<Props> = ({
	onValueChange,
	min: _min,
	max: _max,
	step: _step,
	value,
	onTextChange,
	formatter = (q) => String(q),
	status,
	rightAlign,
	...props
}) => {
	const [inputFallback, setInputFallback] = useState(false);
	const fallbackRef = useRef<HTMLInputElement>(null);
	const style = useMemo(() => {
		return {
			...inputBaseStyle,
			backgroundColor: 'transparent',
			borderColor: 'transparent',
		};
	}, []);

	const span: React.CSSProperties = useMemo(
		() => ({
			borderBottom: '1px dotted ' + BLUE,
			paddingBottom: 1,
			color: BLUE,
			userSelect: 'none',
			fontSize: 13,
			fontVariantNumeric: 'tabular-nums',
		}),
		[]
	);

	const onClick: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
		if (!getClickLock()) {
			e.stopPropagation();
		}

		if (getClickLock()) {
			return;
		}

		setInputFallback(true);
	}, []);

	const onEscape = useCallback(() => {
		setInputFallback(false);
	}, []);

	const onBlur = useCallback(() => {
		if (!fallbackRef.current) {
			return;
		}

		const newValue = fallbackRef.current.value;
		if (newValue.trim() === '') {
			onEscape();
			return;
		}

		if (fallbackRef.current.checkValidity()) {
			onTextChange?.(newValue);
			setInputFallback(false);
		} else {
			fallbackRef.current.reportValidity();
		}
	}, [onEscape, onTextChange]);

	const onKeyPress: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			if (e.key === 'Enter') {
				fallbackRef.current?.blur();
			}
		},
		[]
	);

	useEffect(() => {
		if (inputFallback) {
			fallbackRef.current?.select();
		}
	}, [inputFallback]);

	const deriveStep = useMemo(() => {
		if (_step !== undefined) {
			return _step;
		}

		if (typeof _min === 'number' && isInt(_min)) {
			return 1;
		}

		return 0.0001;
	}, [_min, _step]);

	if (inputFallback) {
		return (
			<HigherZIndex onEscape={onEscape} onOutsideClick={noop}>
				<RemotionInput
					ref={fallbackRef}
					autoFocus
					onKeyPress={onKeyPress}
					onBlur={onBlur}
					min={_min}
					max={_max}
					step={deriveStep}
					defaultValue={value}
					status={status}
					pattern={'[0-9]*[.]?[0-9]*'}
					rightAlign={rightAlign}
					{...props}
				/>
			</HigherZIndex>
		);
	}

	return (
		<button type="button" style={style} onClick={onClick}>
			<span style={span}>{formatter(value as string | number)}</span>
		</button>
	);
};
