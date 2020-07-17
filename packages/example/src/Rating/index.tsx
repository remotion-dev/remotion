import {registerVideo} from '@jonny/motion-core';
import React, {useCallback, useEffect, useState} from 'react';

export const Rating: React.FC = () => {
	const [data, setData] = useState(null);

	const fetchData = useCallback(async () => {
		const resource = await fetch(
			'https://api.anysticker.app/packs/smiley-sticker'
		);
		const json = await resource.json();
		console.log({json});
		setData(json);
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<div style={{flex: 1, display: 'flex', backgroundColor: 'white'}}>
			{JSON.stringify(data)}
		</div>
	);
};

registerVideo(Rating, {
	fps: 30,
	height: 1920,
	width: 1080,
	durationInFrames: 300,
});
