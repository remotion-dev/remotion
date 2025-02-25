import type {EmojiName} from '@remotion/animated-emoji';
import React, {
	createRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import {AbsoluteFill, getRemotionEnvironment} from 'remotion';
import {Card} from './Card';
import type {RemoteData} from './Comp';
import {CurrentCountry} from './CurrentCountry';
import {EmojiCard, type EmojiCardRef} from './EmojiCard';
import {getInitialPositions} from './math';
import {Temperature} from './Temperature';
import {TrendingRepos} from './TrendingRepos';
import type {Location} from './types';

export const Cards: React.FC<{
	readonly onUpdate: (newIndices: number[]) => void;
	readonly indices: number[];
	readonly theme: 'dark' | 'light';
	readonly location: Location | null;
	readonly trending: RemoteData | null;
	readonly onToggle: () => void;
	readonly onLeft: () => void;
	readonly onRight: () => void;
	readonly emojiName: EmojiName;
}> = ({
	onUpdate,
	indices,
	theme,
	onToggle,
	onLeft: onLeftPress,
	onRight: onRightPress,
	emojiName,
	location,
	trending,
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

	const ref = useRef<EmojiCardRef>(null);

	const onLeft = useCallback(() => {
		ref.current?.onRight();
		onRightPress();
	}, [onRightPress]);

	const onRight = useCallback(() => {
		ref.current?.onLeft();
		onLeftPress();
	}, [onLeftPress]);

	return (
		<AbsoluteFill ref={container}>
			{new Array(4).fill(true).map((_, i) => {
				const index = indices[i];
				const content =
					index === 0 ? (
						<TrendingRepos trending={trending} theme={theme} />
					) : index === 1 ? (
						<Temperature
							city={location?.city ? decodeURIComponent(location?.city) : null}
							theme={theme}
							temperatureInCelsius={trending?.temperatureInCelsius ?? null}
						/>
					) : index === 2 ? (
						<CurrentCountry
							countryPaths={trending?.countryPaths ?? null}
							countryLabel={trending?.countryLabel ?? null}
							theme={theme}
						/>
					) : (
						<EmojiCard ref={ref} emojiIndex={emojiName} />
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
						onClickLeft={onLeft}
						onClickRight={onRight}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
