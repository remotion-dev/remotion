import {mapLocalhostAssetToFile} from '../assets/map-localhost-to-file';

test('Should correctly map a localhost URL to an asset', () => {
	expect(
		mapLocalhostAssetToFile({
			localhostAsset: {
				type: 'video',
				src: 'http://localhost:3000/5f25ba62771d1f8195f858ec5ff8e8d6.mp4',
				id: '0.8331499681195862',
				sequenceFrame: 2045,
			},
			webpackBundle:
				'/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicstoSTC7',
		})
	).toEqual({
		type: 'video',
		src:
			'/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicstoSTC7/5f25ba62771d1f8195f858ec5ff8e8d6.mp4',
		id: '0.8331499681195862',
		sequenceFrame: 2045,
	});
});
