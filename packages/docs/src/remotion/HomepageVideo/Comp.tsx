import React, {useCallback, useState} from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	staticFile,
	useVideoConfig,
	type CalculateMetadataFunction,
} from 'remotion';
import {Cards} from './cards/Cards';
import type {Location} from './types';

export type RemoteData = {
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
	location: Location | null;
	trending: RemoteData | null;
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
	DemoPlayerProps
> = async ({props}) => {
	const {trending, location} = await getDataAndProps();

	return {
		durationInFrames: 120,
		fps: 30,
		height: 360,
		width: 640,
		props: {
			...props,
			data: trending,
			location,
			temperatureInCelsius: trending?.temperatureInCelsius ?? 10,
			onToggle() {},
			theme: 'light',
		},
	};
};

export type DemoPlayerProps = {
	readonly playerData: LocationAndTrending;
	readonly onToggle: () => void;
	readonly cardOrder: number[];
	readonly updateCardOrder: (newCardOrder: number[]) => void;
	readonly theme: 'dark' | 'light';
};

export const HomepageVideoComp: React.FC<DemoPlayerProps> = ({
	theme,
	onToggle,
	cardOrder,
	updateCardOrder,
	playerData,
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

	const loweredVolume = 0.5; // this track is too loud by default
	const audioFadeFrame = durationInFrames - 30;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: theme === 'dark' ? '#222' : '#fafafa',
			}}
		>
			<Cards
				key={rerenders}
				onUpdate={onUpdate}
				indices={cardOrder}
				theme={theme}
				data={playerData}
				onToggle={onToggle}
			/>
			<Audio
				src={staticFile('Utope-nature-5s.mp3')}
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
