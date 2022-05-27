import {extractUrlAndSourceFromUrl} from '../offthread-video-server';

test('Extract URL correctly', () => {
	expect(
		extractUrlAndSourceFromUrl(
			'/proxy?src=http%3A%2F%2Flocalhost%3A3000%2Fpublic%2Fframer.mp4&time=1.3'
		)
	).toEqual({
		src: 'http://localhost:3000/public/framer.mp4',
		time: 1.3,
	});
});
