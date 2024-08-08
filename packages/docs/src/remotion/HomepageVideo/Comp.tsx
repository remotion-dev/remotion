import React, {useCallback, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {Cards} from './cards/Cards';
import type {Location} from './types';

export type Trending = {
	repos: string[];
	date: string;
	temperatureInCelsius: number;
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
		'https://bugs.remotion.dev/trending?lat=' +
			location.latitude +
			'&lng=' +
			location.longitude,
	)
		.then((res) => res.json())
		.then((data) => {
			return {
				repos: data.trending.repos.slice(0, 3),
				date: data.trending.dateFetched,
				temperatureInCelsius: Math.round(data.temperature),
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
};

export const schema = z.object({
	theme: z.enum(['light', 'dark']),
});

export const HomepageVideoComp: React.FC<z.infer<typeof schema> & Props> = ({
	theme,
	location,
	trending,
	onToggle,
}) => {
	const [state, setRerenders] = useState({
		rerenders: 0,
		indices: [0, 1, 2, 3],
	});

	const onUpdate = useCallback((newIndices: number[]) => {
		setRerenders((i) => ({
			indices: newIndices,
			rerenders: i.rerenders + 1,
		}));
	}, []);

	if (!location) {
		return null;
	}

	if (!trending) {
		return null;
	}

	return (
		<AbsoluteFill
			style={{
				backgroundColor: theme === 'dark' ? '#222' : 'white',
			}}
		>
			<Cards
				key={state.rerenders}
				onUpdate={onUpdate}
				indices={state.indices}
				theme={theme}
				location={location}
				trending={trending}
				onToggle={onToggle}
				temperatureInCelsius={trending.temperatureInCelsius}
			/>
		</AbsoluteFill>
	);
};
