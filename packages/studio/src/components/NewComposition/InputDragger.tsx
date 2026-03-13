import type {
	InputHTMLAttributes,
	MouseEventHandler,
	PointerEventHandler,
} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {interpolate} from 'remotion';
import {BLUE} from '../../helpers/colors';
import {noop} from '../../helpers/noop';
import {getClickLock, setClickLock} from '../../state/input-dragger-click-lock';
import {HigherZIndex} from '../../state/z-index';
import type {RemInputStatus} from './RemInput';
import {RemotionInput, inputBaseStyle} from './RemInput';

type Props = InputHTMLAttributes<HTMLInputElement> & {
	readonly onValueChange: (newVal: number) => void;
	readonly onValueChangeEnd?: (newVal: number) => void;
	readonly onTextChange: (newVal: string) => void;
	readonly status: RemInputStatus;
	readonly formatter?: (str: number | string) => string;
	readonly rightAlign: boolean;
	readonly small?: boolean;
};

const isInt = (num: number) => {
	return num % 1 === 0;
};

const InputDraggerForwardRefFn: React.ForwardRefRenderFunction<
	HTMLButtonElement,
	Props
> = (
	{
		onValueChange,
		onValueChangeEnd,
		min: _min,
		max: _max,
		step: _step,
		value,
		onTextChange,
		formatter = (q) => String(q),
		status,
		rightAlign,
		small,
		...props
	},
	ref,
) => {
	const [inputFallback, setInputFallback] = useState(false);
	const [dragging, setDragging] = useState(false);
	const fallbackRef = useRef<HTMLInputElement>(null);
	const pointerDownRef = useRef(false);
	const style = useMemo(() => {
		return {
			...inputBaseStyle,
			backgroundColor: 'transparent',
			borderColor: 'transparent',
			padding: '4px 6px',
			...{outline: 'none'},
		};
	}, []);

	const span: React.CSSProperties = useMemo(
		() => ({
			color: dragging ? 'var(--remotion-cli-internals-blue-hovered)' : BLUE,
			cursor: 'ew-resize',
			userSelect: 'none',
			WebkitUserSelect: 'none',
			fontSize: small ? 12 : 14,
			fontVariantNumeric: 'tabular-nums',
		}),
		[dragging, small],
	);

	const onFocus = useCallback(() => {
		if (!small || pointerDownRef.current) {
			return;
		}

		setInputFallback(true);
	}, [small]);

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

	const onInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			const parsed = Number(e.target.value);
			if (e.target.value !== '' && !Number.isNaN(parsed)) {
				onValueChange(parsed);
			}
		},
		[onValueChange],
	);

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
			onValueChangeEnd?.(Number(newValue));

			setInputFallback(false);
		} else {
			fallbackRef.current.reportValidity();
		}
	}, [onEscape, onValueChangeEnd]);

	const onKeyPress: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			if (e.key === 'Enter') {
				fallbackRef.current?.blur();
			}
		},
		[],
	);

	const roundToStep = (val: number, stepSize: number) => {
		const factor = 1 / stepSize;
		return Math.ceil(val * factor) / factor;
	};

	const onPointerDown: PointerEventHandler = useCallback(
		(e) => {
			pointerDownRef.current = true;
			const target = e.currentTarget as HTMLButtonElement;
			const {pageX, pageY, button} = e;
			if (button !== 0) {
				return;
			}

			let lastDragValue: number | null = null;

			const moveListener = (ev: MouseEvent) => {
				const xDistance = ev.pageX - pageX;
				const distanceFromStart = Math.sqrt(
					xDistance ** 2 + (ev.pageY - pageY) ** 2,
				);
				const step = Number(_step ?? 1);
				const min = Number(_min ?? 0);
				const max = Number(_max ?? Infinity);

				if (distanceFromStart > 4) {
					setClickLock(true);
					setDragging(true);
					target.blur();
				}

				const diff = interpolate(
					xDistance,
					[-5, -4, 0, 4, 5],
					[-step, 0, 0, 0, step],
				);
				const newValue = Math.min(max, Math.max(min, Number(value) + diff));
				const roundedToStep = roundToStep(newValue, step);
				lastDragValue = roundedToStep;
				onValueChange(roundedToStep);
			};

			window.addEventListener('mousemove', moveListener);
			window.addEventListener(
				'pointerup',
				() => {
					window.removeEventListener('mousemove', moveListener);
					pointerDownRef.current = false;
					setDragging(false);
					if (lastDragValue !== null && onValueChangeEnd) {
						onValueChangeEnd(lastDragValue);
					}

					setTimeout(() => {
						setClickLock(false);
					}, 2);
				},
				{
					once: true,
				},
			);
		},
		[_step, _min, _max, value, onValueChange, onValueChangeEnd],
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
					onChange={onInputChange}
					min={_min}
					max={_max}
					step={deriveStep}
					defaultValue={value}
					status={status}
					pattern={'[0-9]*[.]?[0-9]*'}
					rightAlign={rightAlign}
					{...props}
					{...(small ? {style: {padding: '4px 6px', fontSize: 12}} : {})}
				/>
			</HigherZIndex>
		);
	}

	return (
		<button
			ref={ref}
			type="button"
			className={'__remotion_input_dragger'}
			style={style}
			onClick={onClick}
			onFocus={onFocus}
			onPointerDown={onPointerDown}
		>
			<span style={span}>{formatter(value as string | number)}</span>
		</button>
	);
};

export const InputDragger = React.forwardRef(InputDraggerForwardRefFn);
