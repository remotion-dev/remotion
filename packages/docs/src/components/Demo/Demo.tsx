import {useColorMode} from '@docusaurus/theme-common';
import {Player} from '@remotion/player';
import React, {useEffect, useState} from 'react';
import type {LocationAndTrending} from '../../remotion/HomepageVideo/Comp';
import {
	HomepageVideoComp,
	getDataAndProps,
} from '../../remotion/HomepageVideo/Comp';
import {ActionRow} from './ActionRow';

export const Demo: React.FC = () => {
	const {colorMode} = useColorMode();
	const [data, setData] = useState<LocationAndTrending | null>(null);

	useEffect(() => {
		getDataAndProps().then((d) => {
			setData(d);
		});
	}, []);

	const strokeColor = colorMode === 'dark' ? 'gray' : 'black';

	return (
		<div>
			<br />
			<br />
			<br />
			<h1>Try it out</h1>
			{data ? (
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
						...data,
					}}
					loop
				/>
			) : null}

			<ActionRow />
		</div>
	);
};
