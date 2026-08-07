import type {VideoSampleWithoutDuration} from './keyframe-bank';

// A sample with a `null` format is opaque -- typically a hardware-decoded frame
// we cannot read back -- so `allocationSize()` is unavailable and the footprint
// has to be estimated from the dimensions.
//
// Opaque decoder output is 4:2:0, not RGBA: NV12 for 8-bit at 1.5 bytes per
// pixel, P010 for 10-bit at 3. Charging 4 bytes per pixel therefore overstates
// every such frame, by 1.3x for 10-bit and 2.7x for 8-bit, and the cache evicts
// (and re-decodes) frames it still had room for. At 4K that is 33.2 MB per
// frame against a 12.4-24.9 MB reality, so a 1 GB budget holds ~30 frames where
// it could hold ~40.
//
// 3 bytes per pixel is exact for 10-bit and still a comfortable upper bound for
// 8-bit, so the estimate stays conservative while giving back a quarter of the
// cache.
const BYTES_PER_PIXEL_FOR_OPAQUE_FRAME = 3;

export const getAllocationSize = (sample: VideoSampleWithoutDuration) => {
	if (sample.format === null) {
		return (
			sample.codedHeight * sample.codedWidth * BYTES_PER_PIXEL_FOR_OPAQUE_FRAME
		);
	}

	return sample.allocationSize();
};
