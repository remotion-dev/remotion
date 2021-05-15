import {assetIsUsedAtTime} from '../assets/asset-is-used-at-time';

test('Should give true is asset is used at time', () => {
	expect(
		assetIsUsedAtTime(
			{
				duration: 2,
				src: 'hi.mp4',
				startInVideo: 0,
				trimLeft: 2,
				type: 'audio',
				volume: 1,
				id: '1',
				isRemote: false,
				playbackRate: 1,
			},
			1
		)
	).toBe(true);
	expect(
		assetIsUsedAtTime(
			{
				duration: 2,
				src: 'hi.mp4',
				startInVideo: 1,
				trimLeft: 0,
				type: 'audio',
				volume: 1,
				id: '1',
				isRemote: false,
				playbackRate: 1,
			},
			1
		)
	).toBe(true);
});

test('Should give false if asset is not used at time', () => {
	expect(
		assetIsUsedAtTime(
			{
				duration: 2,
				src: 'hi.mp4',
				startInVideo: 1,
				trimLeft: 0,
				type: 'audio',
				volume: 1,
				id: '1',
				isRemote: false,
				playbackRate: 1,
			},
			0
		)
	).toBe(false);
	expect(
		assetIsUsedAtTime(
			{
				duration: 2,
				src: 'hi.mp4',
				startInVideo: 1,
				trimLeft: 0,
				type: 'audio',
				volume: 1,
				id: '1',
				isRemote: false,
				playbackRate: 1,
			},
			3
		)
	).toBe(false);
});
