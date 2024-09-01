import {useColorMode} from '@docusaurus/theme-common';
import type {PlayerRef} from '@remotion/player';
import {Player} from '@remotion/player';
import React, {useEffect, useRef, useState} from 'react';
import type {LocationAndTrending} from '../../remotion/HomepageVideo/Comp';
import {
	HomepageVideoComp,
	getDataAndProps,
} from '../../remotion/HomepageVideo/Comp';
import {ActionRow} from './ActionRow';
import {PlayerControls} from './PlayerControls';

export const Demo: React.FC = () => {
	const {colorMode} = useColorMode();
	const [data, setData] = useState<LocationAndTrending | null>(null);
	const ref = useRef<PlayerRef>(null);

	useEffect(() => {
		getDataAndProps().then((d) => {
			setData(d);
		});
	}, []);

	const strokeColor = colorMode === 'dark' ? 'gray' : 'black';

	const [isFullscreen, setIsFullscreen] = useState(false);

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
	console.log({isFullscreen});

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
							border: '2px solid ' + strokeColor,
							borderBottom: '4px solid ' + strokeColor,
							borderRadius: 8,
							width: '100%',
						}}
						inputProps={{
							theme: colorMode,
							onToggle: () => {
								ref.current?.toggle();
							},
							...data,
						}}
						loop
					/>
					<PlayerControls playerRef={ref} durationInFrames={120} fps={30} />
				</>
			) : null}
			<ActionRow />
		</div>
	);
};
