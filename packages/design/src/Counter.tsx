import type {ChangeEvent} from 'react';
import React from 'react';
import {Card} from './Card';
import {cn} from './helpers/cn';

const Triangle: React.FC<{
	readonly rotated: boolean;
}> = ({rotated}) => (
	<svg
		width="12px"
		height="7px"
		viewBox="0 0 12 7"
		fill="none"
		style={{
			transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)',
		}}
	>
		<path
			className="fill-text"
			d="M7.17096 0.475588C6.73198 0.0764969 6.01906 0.0764969 5.58007 0.475588L1.08483 4.56228C0.761737 4.85601 0.666915 5.29341 0.84251 5.67654C1.01811 6.05966 1.42549 6.3087 1.88203 6.3087H10.8725C11.3255 6.3087 11.7364 6.05966 11.912 5.67654C12.0876 5.29341 11.9893 4.85601 11.6697 4.56228L7.17448 0.475588H7.17096Z"
		/>
	</svg>
);

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-end',
	alignItems: 'center',
	height: 42,
	flexShrink: 0,
};

const buttonContainer: React.CSSProperties = {
	display: 'flex',
	width: 30,
	height: 20,
	justifyContent: 'center',
	alignItems: 'center',
	cursor: 'pointer',
};

interface CounterProps {
	readonly count: number;
	readonly setCount: (count: number) => void;
	readonly minCount: number;
	readonly step: number;
	readonly incrementStep: number;
}

const MAX_COUNT = 9999999;

export const Counter: React.FC<CounterProps> = ({
	count,
	setCount,
	minCount,
	step,
	incrementStep,
}) => {
	const decrement = () => {
		if (count > minCount) {
			setCount(Math.max(minCount, count - incrementStep));
		}
	};

	const increment = () => {
		const nextValue = count + incrementStep;
		const roundedValue = Math.round(nextValue / incrementStep) * incrementStep;

		setCount(Math.min(MAX_COUNT, roundedValue));
	};

	const shrink = String(count).length > 6;

	return (
		<Card
			style={container}
			className={cn('w-[140px] flex flex-row overflow-hidden')}
		>
			<input
				className={cn(
					'fontbrand font-medium min-w-[80px] border-0 text-end outline-0 text-text overflow-hidden flex-1 px-0 py-0 pr-2 w-full h-full tabular-nums',
					shrink ? 'text-lg' : 'text-2xl',
				)}
				type="number"
				value={count}
				onClick={(e) => e.currentTarget.select()}
				onChange={(e: ChangeEvent<HTMLInputElement>) => {
					if (e.target.value.trim() === '') {
						setCount(step === 1 ? 1 : minCount);
						return;
					}

					const inputValue = parseInt(e.target.value, 10);
					const validValue = Math.min(
						MAX_COUNT,
						Math.max(inputValue, minCount),
					);

					// For steps > 1, round to the nearest valid step
					if (step > 1) {
						const roundedValue = Math.round(validValue / step) * step;
						setCount(Math.max(roundedValue, minCount));
					} else {
						setCount(validValue);
					}
				}}
			/>
			<div className="flex flex-col  h-full">
				<button
					type="button"
					className="border-0 flex-1 p-0 pt-[5px] bg-transparent"
					style={{
						...buttonContainer,
					}}
					onClick={increment}
				>
					<Triangle rotated={false} />
				</button>
				<button
					type="button"
					className="border-0 flex-1 p-0 bg-transparent pb-[5px] pl-[1px]"
					style={{
						...buttonContainer,
					}}
					onClick={decrement}
				>
					<Triangle rotated />
				</button>
			</div>
		</Card>
	);
};
