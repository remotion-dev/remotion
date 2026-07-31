import type {CSSProperties} from 'react';
import {Easing, interpolate} from 'remotion';

const titleWords = [
	{
		key: 'summer',
		letters: [
			{key: 'summer-s', value: 'S'},
			{key: 'summer-u', value: 'U'},
			{key: 'summer-first-m', value: 'M'},
			{key: 'summer-second-m', value: 'M'},
			{key: 'summer-e', value: 'E'},
			{key: 'summer-r', value: 'R'},
		],
	},
	{
		key: 'collection',
		letters: [
			{key: 'collection-c', value: 'C'},
			{key: 'collection-o', value: 'O'},
			{key: 'collection-first-l', value: 'L'},
			{key: 'collection-second-l', value: 'L'},
			{key: 'collection-e', value: 'E'},
			{key: 'collection-c-2', value: 'C'},
			{key: 'collection-t', value: 'T'},
			{key: 'collection-i', value: 'I'},
			{key: 'collection-o-2', value: 'O'},
			{key: 'collection-n', value: 'N'},
		],
	},
] as const;

const wordLetterOffsets = [0, titleWords[0].letters.length] as const;

export function KineticType({
	frame,
	style,
}: {
	readonly frame: number;
	readonly style?: CSSProperties;
}) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				...style,
			}}
		>
			{titleWords.map((word, wordIndex) => (
				<div key={word.key} style={{display: 'flex'}}>
					{word.letters.map((letter, letterIndex) => {
						const globalLetterIndex =
							wordLetterOffsets[wordIndex] + letterIndex;

						return (
							<div key={letter.key} style={{overflow: 'hidden'}}>
								<span
									style={{
										display: 'inline-block',
										translate: interpolate(
											frame,
											[6 + globalLetterIndex * 2, 18 + globalLetterIndex * 2],
											['0px 80px', '0px 0px'],
											{
												easing: Easing.bezier(0.16, 1, 0.3, 1),
												extrapolateLeft: 'clamp',
												extrapolateRight: 'clamp',
											},
										),
									}}
								>
									{letter.value}
								</span>
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}
