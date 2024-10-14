import React, {useCallback, useState} from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	staticFile,
	useVideoConfig,
	type CalculateMetadataFunction,
} from 'remotion';
import {z} from 'zod';
import {Cards} from './cards/Cards';
import type {EmojiPosition} from './emoji/EmojiCard';
import type {Location} from './types';

export type Trending = {
	repos: string[];
	date: string;
	temperatureInCelsius: number;
	countryLabel: string;
	countryPaths: {
		d: string;
		class: string;
	}[];
};

export type LocationAndTrending = {
	location: Location;
	trending: Trending;
};

export const getDataAndProps = async () => {
	const location = (await fetch(
		'https://bugs-git-homepage-player-remotion.vercel.app/api/location',
	).then((res) => res.json())) as Location;

	const trending = await fetch(
		`https://bugs.remotion.dev/trending?lat=${location.latitude}&lng=${location.longitude}&country=${location.country}`,
	)
		.then((res) => res.json())
		.then((data) => {
			return {
				repos: data.trending.repos.slice(0, 3),
				date: data.trending.dateFetched,
				temperatureInCelsius: Math.round(data.temperature),
				countryLabel: data.countryLabel,
				countryPaths: data.countryPaths,
			};
		});

	return {trending, location};
};

export const calculateMetadata: CalculateMetadataFunction<
	z.infer<typeof schema> & Props
> = async ({props}) => {
	const {trending, location} = await getDataAndProps();

	return {
		durationInFrames: 120,
		fps: 30,
		height: 360,
		width: 640,
		props: {
			...props,
			trending,
			location,
			temperatureInCelsius: trending?.temperatureInCelsius ?? 10,
			onToggle() {},
			theme: 'light',
		},
	};
};

type Props = {
	readonly location: Location;
	readonly trending: null | Trending;
	readonly onToggle: () => void;
	readonly cardOrder: number[];
	readonly updateCardOrder: (newCardOrder: number[]) => void;
	readonly emojiPositions: EmojiPosition;
	readonly onClickLeft: () => void;
	readonly onClickRight: () => void;
	readonly audioVolume: {volume: number; isMuted: boolean};
};

export const schema = z.object({
	theme: z.enum(['light', 'dark']),
});

export const HomepageVideoComp: React.FC<z.infer<typeof schema> & Props> = ({
	theme,
	location,
	trending,
	onToggle,
	cardOrder,
	updateCardOrder,
	emojiPositions,
	onClickLeft,
	onClickRight,
	audioVolume,
}) => {
	const [rerenders, setRerenders] = useState(0);
	const {durationInFrames} = useVideoConfig();

	const onUpdate = useCallback(
		(newIndices: number[]) => {
			setRerenders(rerenders + 1);
			updateCardOrder(newIndices);
		},
		[rerenders, updateCardOrder],
	);

	if (!location) {
		return null;
	}

	if (!trending) {
		return null;
	}

	const loweredVolume = audioVolume.volume * 0.5; // this track is too loud by default
	const audioFadeFrame = durationInFrames - 30;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: theme === 'dark' ? '#222' : 'white',
			}}
		>
			<Cards
				key={rerenders}
				onUpdate={onUpdate}
				indices={cardOrder}
				theme={theme}
				location={location}
				trending={trending}
				onToggle={onToggle}
				temperatureInCelsius={trending.temperatureInCelsius}
				onClickLeft={onClickLeft}
				onClickRight={onClickRight}
				emojiPositions={emojiPositions}
			/>
			<Audio
				src={staticFile('Utope-nature.mp3')}
				muted={audioVolume.isMuted || audioVolume.volume === 0}
				volume={(f) =>
					interpolate(
						f,
						[0, 10, audioFadeFrame, durationInFrames - 5],
						[0, loweredVolume, loweredVolume, 0],
						{
							extrapolateLeft: 'clamp',
						},
					)
				}
			/>
		</AbsoluteFill>
	);
};
