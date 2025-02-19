import type {TrakBox} from './trak/trak';
import {getStsdBox} from './traversal';

export const getVideoCodecFromIsoTrak = (trakBox: TrakBox) => {
	const stsdBox = getStsdBox(trakBox);
	if (stsdBox && stsdBox.type === 'stsd-box') {
		const videoSample = stsdBox.samples.find((s) => s.type === 'video');
		if (videoSample && videoSample.type === 'video') {
			if (videoSample.format === 'hvc1' || videoSample.format === 'hev1') {
				return 'h265';
			}

			if (videoSample.format === 'avc1') {
				return 'h264';
			}

			if (videoSample.format === 'av01') {
				return 'av1';
			}

			// ap4h: ProRes 4444
			if (videoSample.format === 'ap4h') {
				return 'prores';
			}

			// ap4x: ap4x: ProRes 4444 XQ
			if (videoSample.format === 'ap4x') {
				return 'prores';
			}

			// apch: ProRes 422 High Quality
			if (videoSample.format === 'apch') {
				return 'prores';
			}

			// apcn: ProRes 422 Standard Definition
			if (videoSample.format === 'apcn') {
				return 'prores';
			}

			// apcs: ProRes 422 LT
			if (videoSample.format === 'apcs') {
				return 'prores';
			}

			// apco: ProRes 422 Proxy
			if (videoSample.format === 'apco') {
				return 'prores';
			}

			// aprh: ProRes RAW High Quality
			if (videoSample.format === 'aprh') {
				return 'prores';
			}

			// aprn: ProRes RAW Standard Definition
			if (videoSample.format === 'aprn') {
				return 'prores';
			}
		}
	}

	throw new Error('Could not find video codec');
};
