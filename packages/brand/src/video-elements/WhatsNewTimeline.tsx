import type {StudioTimeline} from './Studio';

const captureScale = 1340 / 2700;

// Keep the real Studio row layout and filmstrips from the reference capture.
// Fit the captured track area to the viewport using Studio's default zoom.
// Recreate media labels with the stacked layout from PR #12520.
export const whatsNewTimeline: StudioTimeline = {
	imageSrc:
		'https://remotion.media/homepage/whats-new-timeline-capture-693f4bc1679c.png',
	// Remove the nested Series row so media sits directly under each chapter.
	removedRow: {top: 144 * captureScale, height: 58 * captureScale},
	// Collapse Intro's empty Topic board and Backdrop rows below its captions.
	removedOpeningRows: {
		top: (338 - 58) * captureScale,
		height: (426 - 338) * captureScale,
		width: (1010 - 578) * captureScale,
	},
	width: 1340,
	labelWidth: 200,
	sourceLabelWidth: 578 * captureScale,
	// Retain Intro and Light leaks from the capture, then append the endcard.
	sourceTrackWidth: (2510 - 578) * captureScale,
	trackScale: (1114 * 0.85) / ((2510 - 578) * captureScale),
	pixelsPerFrame: 0.85,
	height: 582 * captureScale,
	soundtrack: {
		name: 'Soundtrack',
		assetName: 'score.wav',
		fadeInFrames: 60,
		fadeOutFrames: 60,
	},
	capturedChapters: [
		{
			name: 'Intro',
			from: 0,
			durationInFrames: 250,
			sourceLeft: 0,
			caption:
				'Here are some of the things that we recently added to Remotion.',
		},
		{
			name: 'Light leaks',
			from: 250,
			durationInFrames: 864,
			sourceLeft: (1010 - 578) * captureScale,
			caption:
				'First up, light leaks. They are a common effect in video editing and now we have a native component for it. They are procedurally generated.',
		},
	],
	ending: {
		selected: true,
		name: 'Outro',
		connectedCompositionName: 'Endcard',
		from: 1114,
		durationInFrames: 180,
		thumbnailSrc:
			'https://remotion.media/homepage/studio-endcard-25914e3e08ad.jpg',
	},
	// Source clip bounds and opacity at the capture's frame 0. Reapply opacity
	// from the displayed playhead after extending the clips horizontally.
	regions: [
		[578, 1010, 84, 144, 1],
		[1010, 2510, 84, 144, 1],
		[578, 1010, 144, 582, 1],
		[1010, 1477, 144, 294, 0.5],
		[1477, 1948, 144, 294, 0.5],
		[1948, 2510, 144, 294, 0.5],
		[1010, 2510, 294, 395, 0.5],
		[1020, 1027, 395, 497, 0.5],
		[1282, 1291, 395, 497, 0.5],
		[1512, 1534, 395, 497, 0.5],
		[2120, 2139, 395, 497, 0.5],
		[2387, 2395, 395, 497, 0.5],
	].map(([left, right, top, bottom, capturedOpacity]) => ({
		left: (left - 578) * captureScale,
		top: top * captureScale,
		width: (right - left) * captureScale,
		height: (bottom - top) * captureScale,
		capturedOpacity,
	})),
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
