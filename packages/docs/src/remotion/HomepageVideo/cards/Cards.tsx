import React, {
	createRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import {AbsoluteFill} from 'remotion';
import type {Trending} from '../Comp';
import {CurrentCountry} from '../CurrentCountry';
import {EmojiCard} from '../EmojiCard';
import {Temperature} from '../Temperature';
import {TrendingRepos} from '../TrendingRepos';
import type {Location} from '../types';
import {Card} from './Card';
import {getInitialPositions} from './math';

export const Cards: React.FC<{
	readonly onUpdate: (newIndices: number[]) => void;
	readonly indices: number[];
	readonly theme: 'dark' | 'light';
	readonly location: Location;
	readonly trending: Trending;
	readonly temperatureInCelsius: number;
	onToggle: () => void;
}> = ({
	onUpdate,
	indices,
	theme,
	location,
	trending,
	onToggle,
	temperatureInCelsius,
}) => {
	const container = useRef<HTMLDivElement>(null);

	const [emojiPosition, setEmojiPosition] = useState(0);

	const [refs] = useState(() => {
		return new Array(4).fill(true).map(() => {
			return createRef<HTMLDivElement>();
		});
	});

	const positions = useRef(getInitialPositions());
	const shouldBePositions = useRef(getInitialPositions());

	useEffect(() => {
		const {current} = container;
		if (!current) {
			return;
		}

		const onClick = (e: MouseEvent) => {
			if (e.target !== current) {
				return;
			}

			onToggle();
		};

		current.addEventListener('click', onClick);

		return () => {
			current.removeEventListener('click', onClick);
		};
	}, [onToggle]);

	const onLeft = useCallback(() => {
		setEmojiPosition((i) => i + 1);
	}, []);

	const onRight = useCallback(() => {
		setEmojiPosition((i) => i - 1);
	}, []);

	return (
		<AbsoluteFill ref={container}>
			{new Array(4).fill(true).map((_, i) => {
				const index = indices[i];
				const content =
					index === 0 ? (
						<TrendingRepos trending={trending} theme={theme} />
					) : index === 1 ? (
						<Temperature
							city={location.city}
							theme={theme}
							temperatureInCelsius={temperatureInCelsius}
						/>
					) : index === 2 ? (
						<CurrentCountry location={location} theme={theme} />
					) : (
						<EmojiCard emojiPosition={emojiPosition} />
					);

				return (
					<Card
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						onUpdate={onUpdate}
						refsToUse={refs}
						index={i}
						content={content}
						positions={positions}
						shouldBePositions={shouldBePositions}
						indices={indices}
						theme={theme}
						withSwitcher={index === 3}
						onLeft={onLeft}
						onRight={onRight}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
