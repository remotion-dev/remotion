import {describe, expect, test} from 'bun:test';
import {showcaseVideos} from '../data/showcase-videos';

describe('Showcase videos should adhere to format guidelines', () => {
	for (const video of showcaseVideos) {
		test(video.title, () => {
			expect(video.description.length).toBeLessThanOrEqual(280);
			expect(video.title.length).toBeLessThanOrEqual(80);
			for (const link of video.links) {
				expect(link.url).not.toContain('<');
				expect(link.url).not.toContain('>');
			}
		});
	}
});
