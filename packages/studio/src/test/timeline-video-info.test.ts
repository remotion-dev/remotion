import {afterEach, expect, test} from 'bun:test';
import type {InteractivitySchema, SequenceControls, TSequence} from 'remotion';
import {getTimelineMediaStartFrame} from '../components/Timeline/get-timeline-media-start-frame';
import {getTimelineVideoInfoWidths} from '../components/Timeline/get-timeline-video-info-widths';
import {
	getTimelineAssetSrcFromSchema,
	getTimelineAssetLinkInfo,
	openTimelineAssetLink,
	splitRemoteSourceForMiddleEllipsis,
} from '../components/Timeline/timeline-asset-link';
import {getTimelineVideoFilmstripTimes} from '../components/Timeline/timeline-video-filmstrip-times';
import {isStaticFileAssetValue} from '../components/Timeline/TimelineAssetField';
import {isVideoWithLastFrameHold} from '../helpers/is-video-with-last-frame-hold';

type TestWindow = Pick<
	Window,
	| 'history'
	| 'location'
	| 'open'
	| 'remotion_isReadOnlyStudio'
	| 'remotion_staticBase'
>;

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
		return;
	}

	Reflect.deleteProperty(globalThis, 'window');
});

const installTestWindow = ({
	onPushState,
	onOpen,
}: {
	onPushState: (url: string | URL | null | undefined) => void;
	onOpen: Window['open'];
}) => {
	const testWindow: TestWindow = {
		remotion_staticBase: '/static-abcdef',
		remotion_isReadOnlyStudio: false,
		history: {
			pushState: (_state, _title, url) => onPushState(url),
		} as History,
		location: {
			pathname: '/',
		} as Location,
		open: onOpen,
	};

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: testWindow,
	});
};

const makeSequenceControls = ({
	schema,
	currentRuntimeValueDotNotation,
}: {
	schema: InteractivitySchema;
	currentRuntimeValueDotNotation: Record<string, unknown>;
}): SequenceControls => ({
	componentIdentity: null,
	componentName: 'Test',
	currentRuntimeValueDotNotation,
	overrideId: 'test',
	schema,
	supportsEffects: false,
});

test('video timeline thumbnails ignore premount and postmount width', () => {
	const withoutPremount = getTimelineVideoInfoWidths({
		visualizationWidth: 400,
		naturalWidth: 500,
		premountWidth: 0,
		postmountWidth: 20,
	});
	const withPremount = getTimelineVideoInfoWidths({
		visualizationWidth: 510,
		naturalWidth: 610,
		premountWidth: 110,
		postmountWidth: 20,
	});

	expect(withPremount).toEqual(withoutPremount);
});

test('video timeline thumbnail widths never go negative', () => {
	expect(
		getTimelineVideoInfoWidths({
			visualizationWidth: 100,
			naturalWidth: 80,
			premountWidth: 70,
			postmountWidth: 70,
		}),
	).toEqual({
		mediaVisualizationWidth: 0,
		mediaNaturalWidth: 0,
	});
});

test('@remotion/media Video holds its last frame', () => {
	expect(
		isVideoWithLastFrameHold({
			type: 'video',
			controls: {
				componentIdentity: 'dev.remotion.media.Video',
			},
		} as TSequence),
	).toBe(true);

	expect(
		isVideoWithLastFrameHold({
			type: 'video',
			controls: null,
		} as TSequence),
	).toBe(false);
});

test('video timeline filmstrip range starts at the registered media frame', () => {
	expect(
		getTimelineVideoFilmstripTimes({
			trimBefore: 908,
			durationInFrames: 120,
			playbackRate: 1,
			fps: 30,
			loopDisplay: undefined,
			frozenMediaFrame: null,
		}),
	).toEqual({
		type: 'range',
		fromSeconds: 908 / 30,
		toSeconds: (908 + 120) / 30,
	});
});

test('video timeline media start applies playback rate after sequence zero', () => {
	expect(
		getTimelineMediaStartFrame({
			startMediaFrom: 5,
			mediaFrameAtSequenceZero: 5,
			sequenceFrameOffset: 10,
			playbackRate: 2,
		}),
	).toBe(25);
});

test('video timeline media start includes trimBefore with no sequence offset', () => {
	expect(
		getTimelineMediaStartFrame({
			startMediaFrom: 31,
			mediaFrameAtSequenceZero: 31,
			sequenceFrameOffset: 0,
			playbackRate: 1,
		}),
	).toBe(31);
});

test('legacy video timeline media start keeps its playback rate behavior', () => {
	expect(
		getTimelineMediaStartFrame({
			startMediaFrom: 10,
			mediaFrameAtSequenceZero: null,
			sequenceFrameOffset: 10,
			playbackRate: 2,
		}),
	).toBe(10);
});

test('video timeline filmstrip uses one timestamp for frozen video', () => {
	expect(
		getTimelineVideoFilmstripTimes({
			trimBefore: 5,
			durationInFrames: 120,
			playbackRate: 1,
			fps: 30,
			loopDisplay: undefined,
			frozenMediaFrame: 29,
		}),
	).toEqual({
		type: 'frozen',
		timestampInSeconds: 29 / 30,
	});
});

test('inspector asset source is derived from the src asset schema', () => {
	const controls = makeSequenceControls({
		schema: {
			src: {
				type: 'asset',
				default: undefined,
				description: 'Source',
				keyframable: false,
			},
		},
		currentRuntimeValueDotNotation: {
			src: '/static-abcdef/video.mp4',
		},
	});

	expect(getTimelineAssetSrcFromSchema(controls)).toBe(
		'/static-abcdef/video.mp4',
	);
});

test('inspector ignores runtime src values without a src asset schema', () => {
	const controls = makeSequenceControls({
		schema: {},
		currentRuntimeValueDotNotation: {
			src: '/static-abcdef/video.mp4',
		},
	});

	expect(getTimelineAssetSrcFromSchema(controls)).toBeNull();
	expect(getTimelineAssetSrcFromSchema(null)).toBeNull();
});

test('only staticFile asset values use the asset picker', () => {
	expect(isStaticFileAssetValue('remotion-file:video.mp4')).toBe(true);
	expect(isStaticFileAssetValue('https://example.com/video.mp4')).toBe(false);
	expect(isStaticFileAssetValue('/video.mp4')).toBe(false);
	expect(isStaticFileAssetValue(undefined)).toBe(false);
});

test('timeline local asset links select the asset and push the asset route', () => {
	const pushedUrls: (string | URL | null | undefined)[] = [];
	installTestWindow({
		onPushState: (url) => {
			pushedUrls.push(url);
		},
		onOpen: () => null,
	});

	const linkInfo = getTimelineAssetLinkInfo(
		'/static-abcdef/folder%20name/image.png',
	);
	const selectedAssets: string[] = [];

	expect(linkInfo).toEqual({
		kind: 'local',
		assetPath: 'folder name/image.png',
		title: 'folder name/image.png',
	});

	if (!linkInfo) {
		throw new Error('Expected local asset link');
	}

	openTimelineAssetLink(linkInfo, (asset) => {
		selectedAssets.push(asset);
	});

	expect(selectedAssets).toEqual(['folder name/image.png']);
	expect(pushedUrls).toEqual(['/assets/folder name/image.png']);
});

test('timeline remote asset links still open in a new tab', () => {
	const pushedUrls: (string | URL | null | undefined)[] = [];
	const openedUrls: Parameters<Window['open']>[] = [];
	installTestWindow({
		onPushState: (url) => {
			pushedUrls.push(url);
		},
		onOpen: (...args) => {
			openedUrls.push(args);
			return null;
		},
	});

	const linkInfo = getTimelineAssetLinkInfo('https://example.com/image.png');

	expect(linkInfo).toEqual({
		kind: 'remote',
		href: 'https://example.com/image.png',
		title: 'example.com',
	});

	if (!linkInfo) {
		throw new Error('Expected remote asset link');
	}

	openTimelineAssetLink(linkInfo, () => {
		throw new Error('Remote links should not select assets');
	});

	expect(openedUrls).toEqual([
		['https://example.com/image.png', '_blank', 'noopener,noreferrer'],
	]);
	expect(pushedUrls).toEqual([]);
});

test('remote asset URLs split before the filename for middle ellipsis', () => {
	const src = 'https://example.com/a/very/long/path/video.mp4?download=1';
	const parts = splitRemoteSourceForMiddleEllipsis(src);

	expect(parts).toEqual({
		leading: 'https://example.com/a/very/long/path/',
		trailing: 'video.mp4?download=1',
	});
	expect(parts.leading + parts.trailing).toBe(src);
});
