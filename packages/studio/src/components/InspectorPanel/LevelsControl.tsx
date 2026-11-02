import React, {useRef} from 'react';
import {LIGHT_TEXT, TRANSPARENT, WHITE} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';

export type LevelsValues = {
	blackPoint: number;
	whitePoint: number;
	gamma: number;
	outputBlack: number;
	outputWhite: number;
};

export type LevelsField = keyof LevelsValues;

const labels: Record<LevelsField, string> = {
	blackPoint: 'Input black',
	whitePoint: 'Input white',
	gamma: 'Gamma',
	outputBlack: 'Output black',
	outputWhite: 'Output white',
};

const LevelsHandle: React.FC<{
	readonly field: LevelsField;
	readonly values: LevelsValues;
	readonly disabled: boolean;
	readonly onChange: (
		field: LevelsField,
		value: number,
		commit: boolean,
	) => void;
	readonly onCancel: () => void;
}> = ({field, values, disabled, onChange, onCancel}) => {
	const drag = useRef<{
		left: number;
		width: number;
		offset: number;
		value: number;
		initialValue: number;
	} | null>(null);
	const gamma = field === 'gamma';
	const inputGap = Math.min(0.001, values.whitePoint - values.blackPoint);
	const min = gamma
		? 0.01
		: field === 'whitePoint'
			? values.blackPoint + inputGap
			: 0;
	const max = gamma
		? 10
		: field === 'blackPoint'
			? values.whitePoint - inputGap
			: 1;
	const position = gamma
		? values.blackPoint +
			(values.whitePoint - values.blackPoint) * 0.5 ** values.gamma
		: values[field];
	const color = gamma
		? '#888'
		: field === 'blackPoint' || field === 'outputBlack'
			? '#151515'
			: '#fff';
	const clamp = (value: number) => Math.min(max, Math.max(min, value));
	const fromPointer = (clientX: number) => {
		if (!drag.current) return values[field];
		const fraction = Math.min(
			1,
			Math.max(
				0,
				(clientX - drag.current.left - drag.current.offset) /
					drag.current.width,
			),
		);
		const value = gamma
			? Math.log(
					Math.min(
						0.999999,
						Math.max(
							0.000001,
							(fraction - values.blackPoint) /
								(values.whitePoint - values.blackPoint),
						),
					),
				) / Math.log(0.5)
			: fraction;
		return clamp(
			Math.round(value * (gamma ? 100 : 1000)) / (gamma ? 100 : 1000),
		);
	};

	return (
		<button
			type="button"
			role="slider"
			aria-label={labels[field]}
			aria-valuemin={min}
			aria-valuemax={max}
			aria-valuenow={values[field]}
			aria-valuetext={values[field].toFixed(gamma ? 2 : 3)}
			title={`${labels[field]}: ${values[field].toFixed(gamma ? 2 : 3)}`}
			disabled={disabled}
			className={`${FOCUS_VISIBLE_ONLY_CLASS_NAME} ${HOVERABLE_CLASS_NAME}`}
			style={{
				...hoverableStyle({
					idleBackground: TRANSPARENT,
					hoverBackground: TRANSPARENT,
					idleColor: LIGHT_TEXT,
					hoverColor: WHITE,
				}),
				position: 'absolute',
				left: `${Math.min(1, Math.max(0, position)) * 100}%`,
				top: 0,
				width: 16,
				height: 20,
				transform: 'translateX(-50%)',
				padding: 0,
				border: 'none',
				cursor: 'default',
				touchAction: 'none',
				opacity: disabled ? 0.35 : 1,
			}}
			onPointerDown={(event) => {
				if (event.button !== 0) return;
				event.stopPropagation();
				const rect = event.currentTarget.parentElement!.getBoundingClientRect();
				if (rect.width === 0) return;
				drag.current = {
					left: rect.left,
					width: rect.width,
					offset: event.clientX - rect.left - position * rect.width,
					value: values[field],
					initialValue: values[field],
				};
				event.currentTarget.setPointerCapture(event.pointerId);
			}}
			onPointerMove={(event) => {
				if (!drag.current) return;
				const value = fromPointer(event.clientX);
				if (value === drag.current.value) return;
				drag.current.value = value;
				onChange(field, value, false);
			}}
			onPointerUp={(event) => {
				if (!drag.current) return;
				const {value, initialValue} = drag.current;
				drag.current = null;
				event.currentTarget.releasePointerCapture(event.pointerId);
				if (value === initialValue) {
					onCancel();
				} else {
					onChange(field, value, true);
				}
			}}
			onLostPointerCapture={() => {
				if (!drag.current) return;
				drag.current = null;
				onCancel();
			}}
			onKeyDown={(event) => {
				if (event.key === 'Escape') {
					if (!drag.current) return;
					event.preventDefault();
					event.stopPropagation();
					drag.current = null;
					onCancel();
					return;
				}

				const direction =
					event.key === 'ArrowRight' || event.key === 'ArrowUp'
						? 1
						: event.key === 'ArrowLeft' || event.key === 'ArrowDown'
							? -1
							: 0;
				if (!direction && event.key !== 'Home' && event.key !== 'End') return;
				event.preventDefault();
				event.stopPropagation();
				const value =
					event.key === 'Home'
						? min
						: event.key === 'End'
							? max
							: values[field] + direction * (event.shiftKey ? 0.1 : 0.01);
				const nextValue =
					event.key === 'Home' || event.key === 'End'
						? value
						: clamp(Math.round(value * 1000) / 1000);
				if (nextValue !== values[field]) {
					onChange(field, nextValue, true);
				}
			}}
		>
			<svg
				width="14"
				height="16"
				viewBox="0 0 14 16"
				style={{display: 'block', margin: 'auto', overflow: 'visible'}}
				aria-hidden="true"
			>
				<path
					d="M7 1 L13 9 L13 14 L1 14 L1 9 Z"
					fill={color}
					stroke="currentColor"
					strokeWidth="1"
				/>
			</svg>
		</button>
	);
};

export const LevelsControl: React.FC<{
	readonly values: LevelsValues;
	readonly editable: Record<LevelsField, boolean>;
	readonly onChange: (
		field: LevelsField,
		value: number,
		commit: boolean,
	) => void;
	readonly onCancel: () => void;
	readonly histogram: React.ReactNode;
}> = ({values, editable, onChange, onCancel, histogram}) => {
	return (
		<div style={{padding: '8px 20px 4px', userSelect: 'none'}}>
			<div style={{fontSize: 11, color: LIGHT_TEXT, marginBottom: 6}}>
				Input levels
			</div>
			{histogram}
			<div
				style={{height: 6, background: 'linear-gradient(to right, #000, #fff)'}}
			/>
			<div style={{position: 'relative', height: 26}}>
				{(['blackPoint', 'gamma', 'whitePoint'] as const).map((field) => (
					<LevelsHandle
						key={field}
						field={field}
						values={values}
						disabled={!editable[field]}
						onChange={onChange}
						onCancel={onCancel}
					/>
				))}
			</div>
			<div style={{fontSize: 11, color: LIGHT_TEXT, marginBottom: 6}}>
				Output levels
			</div>
			<div
				style={{
					height: 10,
					background: 'linear-gradient(to right, #000, #fff)',
					border: '1px solid #555',
				}}
			/>
			<div style={{position: 'relative', height: 22}}>
				{(['outputBlack', 'outputWhite'] as const).map((field) => (
					<LevelsHandle
						key={field}
						field={field}
						values={values}
						disabled={!editable[field]}
						onChange={onChange}
						onCancel={onCancel}
					/>
				))}
			</div>
		</div>
	);
};
