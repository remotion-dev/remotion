import React from 'react';
import {Video} from 'remotion';
import {getAssetsForMarkup} from './get-assets-for-markup';

test('Should be able to collect assets', async () => {
	const Markup: React.FC = () => (
		<div>
			<Video src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" />
		</div>
	);
	const assets = getAssetsForMarkup(Markup);
	console.log(assets);
	expect(assets.length).toBe(1);
});
