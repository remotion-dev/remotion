import React, {createRef, useEffect, useRef, useState} from 'react';
import {AbsoluteFill, getRemotionEnvironment} from 'remotion';
import type {LocationAndTrending} from '../Comp';
import {CurrentCountry} from '../CurrentCountry';
import {Temperature} from '../Temperature';
import {TrendingRepos} from '../TrendingRepos';
import {EmojiCard, type EmojiPosition} from '../emoji/EmojiCard';
import {Card} from './Card';
import {getInitialPositions} from './math';

export const Cards: React.FC<{
	readonly onUpdate: (newIndices: number[]) => void;
	readonly indices: number[];
	readonly theme: 'dark' | 'light';
	readonly data: LocationAndTrending;
	onToggle: () => void;
	onClickLeft: () => void;
	onClickRight: () => void;
	emojiPositions: EmojiPosition;
}> = ({
	onUpdate,
	indices,
	theme,
	onToggle,
	onClickLeft,
	onClickRight,
	emojiPositions,
	data,
}) => {
	const container = useRef<HTMLDivElement>(null);

	const [refs] = useState(() => {
		return new Array(4).fill(true).map(() => {
			return createRef<HTMLDivElement>();
		});
	});

	const positions = useRef(getInitialPositions());
	const shouldBePositions = useRef(getInitialPositions());
	const {isRendering} = getRemotionEnvironment();

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

	return (
		<AbsoluteFill ref={container}>
			{new Array(4).fill(true).map((_, i) => {
				const index = indices[i];
				const content =
					index === 0 ? (
						<TrendingRepos trending={data.trending} theme={theme} />
					) : index === 1 ? (
						<Temperature
							city={data.location?.city ?? null}
							theme={theme}
							temperatureInCelsius={data.trending?.temperatureInCelsius ?? null}
						/>
					) : index === 2 ? (
						<CurrentCountry
							countryPaths={data.trending?.countryPaths ?? null}
							countryLabel={data.trending?.countryLabel ?? null}
							theme={theme}
						/>
					) : (
						<EmojiCard emojiPositions={emojiPositions} />
					);

				return (
					<Card
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						onUpdate={onUpdate}
						// @ts-expect-error
						refsToUse={refs}
						index={i}
						content={content}
						positions={positions}
						shouldBePositions={shouldBePositions}
						indices={indices}
						theme={theme}
						withSwitcher={index === 3 && !isRendering}
						onClickLeft={onClickLeft}
						onClickRight={onClickRight}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
