import {useColorMode} from '@docusaurus/theme-common';
import {Player} from '@remotion/player';
import React, {useEffect, useState} from 'react';
import {HomepageVideoComp} from '../../remotion/HomepageVideo/Comp';
import type {Location} from '../../remotion/HomepageVideo/types';
import {ActionRow} from './ActionRow';

export const Demo: React.FC = () => {
	const {colorMode} = useColorMode();
	const [location, setLocation] = useState<Location | null>(null);

	useEffect(() => {
		fetch('https://bugs-git-homepage-player-remotion.vercel.app/api/location')
			.then((res) => res.json())
			.then((data: Location) => {
				setLocation(data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	const strokeColor = colorMode === 'dark' ? 'gray' : 'black';

	return (
		<div>
			<br />
			<br />
			<br />
			<h1>Try it out</h1>
			<Player
				component={HomepageVideoComp}
				compositionWidth={640}
				compositionHeight={360}
				durationInFrames={120}
				fps={30}
				autoPlay
				controls
				clickToPlay={false}
				style={{
					border: '2px solid ' + strokeColor,
					borderBottom: '4px solid ' + strokeColor,
					borderRadius: 8,
					width: '100%',
				}}
				inputProps={{
					theme: colorMode,
					location,
				}}
				loop
			/>
			<ActionRow />
		</div>
	);
};
