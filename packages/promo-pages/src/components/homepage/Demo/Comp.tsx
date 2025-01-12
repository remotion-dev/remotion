import type {EmojiName} from '@remotion/animated-emoji';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
	AbsoluteFill,
	Audio,
	prefetch,
	staticFile,
	type CalculateMetadataFunction,
} from 'remotion';
import {Cards} from './Cards';
import type {Location} from './types';

export type RemoteData = {
	repos: string[];
	date: string | number;
	temperatureInCelsius: number;
	countryLabel: string;
	countryPaths: {
		d: string;
		class: string;
	}[];
};

export type LocationAndTrending = {
	readonly location: Location | null;
	readonly trending: RemoteData | null;
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

export const calculateMetadata: CalculateMetadataFunction<DemoPlayerProps> = ({
	props,
}) => {
	return {
		durationInFrames: 120,
		fps: 30,
		height: 360,
		width: 640,
		props: {
			...props,
		},
	};
};

export type DemoPlayerProps = {
	readonly onToggle: () => void;
	readonly cardOrder: number[];
	readonly updateCardOrder: (newCardOrder: number[]) => void;
	readonly theme: 'dark' | 'light';
	readonly onClickLeft: () => void;
	readonly onClickRight: () => void;
	readonly emojiIndex: number;
} & LocationAndTrending;

const fireAudio = staticFile('fire.mp3');
const partyHornAudio = staticFile('partyhorn.mp3');
const sadAudio = staticFile('sad.mp3');

export const HomepageVideoComp: React.FC<DemoPlayerProps> = ({
	theme,
	onToggle,
	cardOrder,
	updateCardOrder,
	location,
	trending,
	emojiIndex,
	onClickLeft,
	onClickRight,
}) => {
	const [rerenders, setRerenders] = useState(0);

	const onUpdate = useCallback(
		(newIndices: number[]) => {
			setRerenders(rerenders + 1);
			updateCardOrder(newIndices);
		},
		[rerenders, updateCardOrder],
	);

	const emoji = useMemo((): EmojiName => {
		if ((emojiIndex + 10000 * 3) % 3 === 1) {
			return 'melting';
		}

		if ((emojiIndex + 10000 * 3) % 3 === 2) {
			return 'fire';
		}

		return 'partying-face';
	}, [emojiIndex]);

	const audioSrc = useMemo(() => {
		if (emoji === 'fire') {
			return fireAudio;
		}

		if (emoji === 'partying-face') {
			return partyHornAudio;
		}

		return sadAudio;
	}, [emoji]);

	useEffect(() => {
		const a = prefetch(fireAudio);
		const b = prefetch(partyHornAudio);
		const c = prefetch(sadAudio);

		return () => {
			a.free();
			b.free();
			c.free();
		};
	}, []);

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
				location={location}
				trending={trending}
				onToggle={onToggle}
				onLeft={onClickLeft}
				onRight={onClickRight}
				emojiName={emoji}
			/>
			{audioSrc ? <Audio src={audioSrc} /> : null}
		</AbsoluteFill>
	);
};
