import React from 'react';
import {Video} from 'remotion';
import {calculateAssetPositions} from '../assets/calculate-asset-positions';
import {getAssetsForMarkup} from './get-assets-for-markup';

test('Should be able to collect assets', async () => {
	const Markup: React.FC = () => (
		<div>
			<Video src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" />
		</div>
	);
	const assets = await getAssetsForMarkup(Markup, {
		width: 1080,
		height: 1080,
		fps: 30,
		durationInFrames: 60,
	});
	const assetPositions = calculateAssetPositions(assets);
	expect(assetPositions.length).toBe(1);
	const firstPosition = assetPositions[0];
	const {id, ...position} = firstPosition;
	expect(position).toEqual({
		type: 'video',
		src:
			'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
		sequenceFrame: 0,
		duration: 60,
		startInVideo: 0,
	});
});
