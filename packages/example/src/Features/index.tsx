import {Video} from '@remotion/core';
import React from 'react';

export const Features = () => {
	const tray = require('./tray.webm').default;
	const watermelon = require('./watermelon.webm').default;
	const textstickers = require('./textstickers.webm').default;
	return (
		<div
			style={{
				flex: 1,
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
			}}
		>
			<Video src={tray} style={{height: 400, width: 400}} />
			<Video src={textstickers} style={{height: 700, width: 700}} />
			<Video src={watermelon} style={{height: 700, width: 700}} />
		</div>
	);
};
