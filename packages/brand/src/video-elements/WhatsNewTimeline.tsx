import type {StudioTimeline} from './Studio';

const captureScale = 1340 / 2700;

// Keep the real Studio row layout and filmstrips from the reference capture.
// Use a fixed scale as the app narrows, cropping the track area horizontally.
// Recreate media labels with the stacked layout from PR #12520.
export const whatsNewTimeline: StudioTimeline = {
	imageSrc:
		'https://remotion.media/homepage/whats-new-timeline-capture-693f4bc1679c.png',
	width: 1340,
	labelWidth: 200,
	sourceLabelWidth: 578 * captureScale,
	pixelsPerFrame: ((1010 - 578) / 208) * captureScale,
	height: 582 * captureScale,
	mediaLabels: [
		{
			top: 202 * captureScale,
			height: 90 * captureScale,
			left: 128 * captureScale,
			name: '<Video>',
			assetName: 'whats1.mp4',
		},
		{
			top: 484 * captureScale,
			height: 98 * captureScale,
			left: 128 * captureScale,
			name: 'Title whoosh',
			assetName: 'whoosh.wav',
		},
	],
};
