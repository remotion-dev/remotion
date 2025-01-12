import type {ChangeEvent} from 'react';
import React from 'react';
import {cn} from '../../cn';

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
			fill="currentcolor"
			d="M7.17096 0.475588C6.73198 0.0764969 6.01906 0.0764969 5.58007 0.475588L1.08483 4.56228C0.761737 4.85601 0.666915 5.29341 0.84251 5.67654C1.01811 6.05966 1.42549 6.3087 1.88203 6.3087H10.8725C11.3255 6.3087 11.7364 6.05966 11.912 5.67654C12.0876 5.29341 11.9893 4.85601 11.6697 4.56228L7.17448 0.475588H7.17096Z"
		/>
	</svg>
);

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-end',
	alignItems: 'center',
	borderRadius: 4,
	height: 42,
	overflow: 'hidden',
	flexShrink: 0,
};

const buttonContainer: React.CSSProperties = {
	display: 'flex',
	width: 30,
	padding: 2,
	height: 20,
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: 'inherit',
	cursor: 'pointer',
};

interface CounterProps {
	readonly count: number;
	readonly setCount: (count: number) => void;
	readonly minCount?: number;
}

export const Counter: React.FC<CounterProps> = ({
	count,
	setCount,
	minCount = 0,
}) => {
	const decrement = () => {
		if (count > minCount) {
			setCount(count - 1);
		}
	};

	const increment = () => {
		setCount(count + 1);
	};

	return (
		<div style={container} className={cn('border-effect w-[110px]')}>
			<input
				className={
					'fontbrand text-2xl font-medium min-w-[60px] border-0 text-end bg-transparent outline-0'
				}
				type="number"
				onClick={(e) => e.currentTarget.select()}
				value={count}
				onChange={(e: ChangeEvent<HTMLInputElement>) => {
					if (e.target.value.trim() === '') {
						setCount(1);
						return;
					}

					const max = Math.max(parseInt(e.target.value, 10), 1);
					setCount(max);
				}}
			/>
			<div className="flex flex-col ml-3 h-full">
				<button
					type="button"
					className="border-0 border-l-2 border-l-solid border-b-2 flex-1"
					style={{
						...buttonContainer,
					}}
					onClick={increment}
				>
					<Triangle rotated={false} />
				</button>
				<button
					type="button"
					className="border-0 border-l-2 border-l-solid flex-1"
					style={{
						...buttonContainer,
					}}
					onClick={decrement}
				>
					<Triangle rotated />
				</button>
			</div>
		</div>
	);
};
