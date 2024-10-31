import {useColorMode} from '@docusaurus/theme-common';
import type {PlayerRef} from '@remotion/player';
import {Player} from '@remotion/player';
import React, {
	type CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {DemoTitle} from '../../../components/LambdaSplash/VideoAppsTitle';
import {PALETTE} from '../../../components/layout/colors';
import type {
	DemoPlayerProps,
	LocationAndTrending,
	RemoteData,
} from '../../remotion/HomepageVideo/Comp';
import {
	HomepageVideoComp,
	getDataAndProps,
} from '../../remotion/HomepageVideo/Comp';
import type {Location} from '../../remotion/HomepageVideo/types';
import {DemoError} from './DemoError';
import {RenderButton} from './DemoRender';
import {DownloadNudge} from './DownloadNudge';
import {DragAndDropNudge} from './DragAndDropNudge';
import {PlayerControls} from './PlayerControls';
import {ThemeNudge} from './ThemeNudge';

const style: React.CSSProperties = {
	width: '100%',
	aspectRatio: '640 / 360',
	borderBottom: `2px solid ${PALETTE.BOX_STROKE}`,
	touchAction: 'none', // prevent page from scrolling when dragging children on mobile
};

const playerWrapper: CSSProperties = {
	border: `2px solid ${PALETTE.BOX_STROKE}`,
	borderBottom: `4px solid ${PALETTE.BOX_STROKE}`,
	borderRadius: 8,
	width: '100%',
	overflow: 'hidden',
};

export const Demo: React.FC = () => {
	const {colorMode} = useColorMode();
	const [data, setData] = useState<LocationAndTrending | null>(null);
	const ref = useRef<PlayerRef>(null);

	const [isFullscreen, setIsFullscreen] = useState(false);
	const [cardOrder, setCardOrder] = useState([0, 1, 2, 3]);
	const [emojiIndex, setEmojiIndex] = useState<number>(0);
	const [error, setError] = useState(false);

	useEffect(() => {
		getDataAndProps()
			.then((d) => {
				setData(d);
			})
			.catch((err) => {
				console.log(err);
				setError(true);
			});
	}, []);

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

	const updateCardOrder = useCallback((newCardOrder: number[]) => {
		setCardOrder(newCardOrder);
	}, []);

	const props: DemoPlayerProps = useMemo(() => {
		return {
			theme: colorMode,
			onToggle: () => {
				ref.current?.toggle();
			},
			cardOrder,
			updateCardOrder,
			location: data?.location ?? null,
			trending: data?.trending ?? null,
			onClickLeft: () => {
				setEmojiIndex((e) => e - 1);
			},
			onClickRight: () => {
				setEmojiIndex((e) => e + 1);
			},
			emojiIndex,
		};
	}, [cardOrder, emojiIndex, colorMode, data, updateCardOrder]);

	return (
		<div>
			<br />
			<br />
			<DemoTitle />
			<div style={{display: 'flex', flexDirection: 'row'}}>
				<DragAndDropNudge />
				<div style={{flex: 1}} />
				<ThemeNudge />
			</div>
			<div style={playerWrapper}>
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
					style={style}
					initiallyMuted
					inputProps={props}
					loop
				/>
				<PlayerControls playerRef={ref} durationInFrames={120} fps={30}>
					<RenderButton
						renderData={
							data
								? {
										cardOrder,
										emojiIndex,
										location: data.location as Location,
										theme: colorMode,
										trending: data.trending as RemoteData,
									}
								: null
						}
					/>
				</PlayerControls>
			</div>
			{error ? <DemoError /> : null}
			<DownloadNudge />
		</div>
	);
};
