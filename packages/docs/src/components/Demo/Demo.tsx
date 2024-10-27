import {useColorMode} from '@docusaurus/theme-common';
import type {PlayerRef} from '@remotion/player';
import {Player} from '@remotion/player';
import {preloadAudio} from '@remotion/preload';
import React, {
	type CSSProperties,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import {staticFile} from 'remotion';
import type {LocationAndTrending} from '../../remotion/HomepageVideo/Comp';
import {
	HomepageVideoComp,
	getDataAndProps,
} from '../../remotion/HomepageVideo/Comp';
import type {EmojiPosition} from '../../remotion/HomepageVideo/emoji/EmojiCard';
import {ActionRow} from './ActionRow';
import {PlayerControls} from './PlayerControls';
import styles from './player.module.css';

export const Demo: React.FC = () => {
	const {colorMode} = useColorMode();
	const [data, setData] = useState<LocationAndTrending | null>(null);
	const [mountPlayerAudio, setmountPlayerAudio] = useState(false);
	const ref = useRef<PlayerRef>(null);

	useEffect(() => {
		getDataAndProps().then((d) => {
			setData(d);
		});
	}, []);

	const strokeColor = colorMode === 'dark' ? 'gray' : 'black';

	const [isFullscreen, setIsFullscreen] = useState(false);
	const [cardOrder, setCardOrder] = useState([0, 1, 2, 3]);

	const activeTranslationStyle =
		'transform 0.2s ease-in, opacity 0.2s ease-in-out';

	const [emojiPositions, setEmojiPositions] = useState<EmojiPosition>({
		prev: 'melting',
		current: 'partying-face',
		next: 'fire',
		translation: 0,
		translationStyle: activeTranslationStyle,
	});

	const playerWrapper: CSSProperties = {
		border: '2px solid ' + strokeColor,
		borderBottom: '4px solid ' + strokeColor,
		borderRadius: 8,
		width: '100%',
	};

	useEffect(() => {
		const {current: playerRef} = ref;
		if (!playerRef || !data) {
			return;
		}

		const onFullscreenChange = () => {
			setIsFullscreen(playerRef.isFullscreen());
		};

		playerRef.addEventListener('fullscreenchange', onFullscreenChange);

		return () => {
			playerRef.removeEventListener('fullscreenchange', onFullscreenChange);
		};
	}, [data]);

	const updateCardOrder = (newCardOrder: number[]) => {
		setCardOrder(newCardOrder);
	};

	const onClickLeft = useCallback(() => {
		setEmojiPositions((c) => {
			return {
				...c,
				translation: -33.3,
				translationStyle: activeTranslationStyle,
			};
		});
		// after the animation is done, we need to update the emoji contents
		setTimeout(() => {
			setEmojiPositions((c) => {
				return {
					prev: c.next,
					current: c.prev,
					next: c.current,
					translation: 0,
					translationStyle: undefined,
				};
			});
		}, 200);
	}, []);

	const onClickRight = useCallback(() => {
		setEmojiPositions((c) => {
			return {
				...c,
				translation: 33.3,
				translationStyle: activeTranslationStyle,
			};
		});
		setTimeout(() => {
			setEmojiPositions((c) => {
				return {
					prev: c.current,
					current: c.next,
					next: c.prev,
					translation: 0,
					translationStyle: '',
				};
			});
		}, 200);
	}, []);

	preloadAudio(staticFile('Utope-nature-5s.mp3'));

	return (
		<div>
			<br />
			<br />
			<br />
			<h1>Try it out</h1>
			{data ? (
				<>
					<Player
						ref={ref}
						component={HomepageVideoComp}
						compositionWidth={640}
						compositionHeight={360}
						durationInFrames={120}
						fps={30}
						autoPlay
						controls={isFullscreen}
						clickToPlay={false}
						style={{
							...playerWrapper,
							touchAction: 'none', // prevent page from scrolling when dragging children on mobile
						}}
						initiallyMuted
						inputProps={{
							theme: colorMode,
							onToggle: () => {
								ref.current?.toggle();
							},
							cardOrder,
							updateCardOrder,
							emojiPositions,
							onClickLeft,
							onClickRight,
							mountPlayerAudio,
							...data,
						}}
						loop
					/>
					<PlayerControls
						playerRef={ref}
						durationInFrames={120}
						fps={30}
						setmountPlayerAudio={setmountPlayerAudio}
					/>
				</>
			) : (
				<>
					<div
						style={{
							aspectRatio: '640 / 360',
							...playerWrapper,
						}}
					/>
					<div
						className={styles['controls-wrapper']}
						style={{justifyContent: 'center'}}
					>
						<p>Loading Player</p>
					</div>
				</>
			)}
			<ActionRow />
		</div>
	);
};
