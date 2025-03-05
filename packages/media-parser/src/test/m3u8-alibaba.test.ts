import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test(
	'm3u8 alibaba',
	async () => {
		const {m3uStreams} = await parseMedia({
			src: 'https://alibaba-cdn.net/hls4/aWQ9NTU5MTM4OzI5OTc1MjUzOTQ7MzQ2NTY5OTc7MzYyMDU7MTc0MTE4MzAyNSZoPURLVjZCakJiSVZiRk1jRXNrOUJXbHcmZT0xNzQxMjY5NDI1/36205.m3u8?loc=nl',
			fields: {
				m3uStreams: true,
			},
			acknowledgeRemotionLicense: true,
		});
		expect(m3uStreams?.length).toEqual(4);
	},
	{timeout: 100000},
);
