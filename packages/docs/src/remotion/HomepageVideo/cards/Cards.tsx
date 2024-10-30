import React, {
	createRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import {AbsoluteFill, getRemotionEnvironment} from 'remotion';
import type {LocationAndTrending} from '../Comp';
import {CurrentCountry} from '../CurrentCountry';
import {Temperature} from '../Temperature';
import {TrendingRepos} from '../TrendingRepos';
import type {EmojiCardRef} from '../emoji/EmojiCard';
import {EmojiCard} from '../emoji/EmojiCard';
import {Card} from './Card';
import {getInitialPositions} from './math';

export const Cards: React.FC<{
	readonly onUpdate: (newIndices: number[]) => void;
	readonly indices: number[];
	readonly theme: 'dark' | 'light';
	readonly data: LocationAndTrending;
	readonly onToggle: () => void;
	readonly onLeft: () => void;
	readonly onRight: () => void;
}> = ({
	onUpdate,
	indices,
	theme,
	onToggle,
	data,
	onLeft: onLeftPress,
	onRight: onRightPress,
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
		ref.current?.onLeft();
		onLeftPress();
	}, [onLeftPress]);

	const onRight = useCallback(() => {
		ref.current?.onRight();
		onRightPress();
	}, [onRightPress]);

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
						<EmojiCard ref={ref} />
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
