import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {EffectsRecordingComposition} from './EffectsRecordingComposition';
import {ExploreElementsRecording20261027Composition} from './ExploreElementsRecording20261027Composition';
import {ExploreKeyframesRecording20261027Composition} from './ExploreKeyframesRecording20261027Composition';
import {ExploreNewRecording20261028Composition} from './ExploreNewRecording20261028Composition';
import {ExploreStudioRecording20261027Composition} from './ExploreStudioRecording20261027Composition';
import {ExploreZoomBlurRecording20261028Composition} from './ExploreZoomBlurRecording20261028Composition';
import {EXPLORE_CAMERA_ANGLE} from './HomepageAssets/ExploreRemotion/camera-angle';
import {ParameterizationRecordingComposition} from './ParameterizationRecordingComposition';
import {RenderModalCodecPreview} from './RenderModalCodec';

// Rebuild the homepage framing from original capture pixels and cursor layers.
// The 1080px camera plane is transformed as DOM, without a downscaled pre-render.
const StudioHomepageMenusContent = () => {
	const {fps, width, height} = useVideoConfig();
	const frame = 60 + (useCurrentFrame() * 60 * 2) / fps;

	return (
		<div
			style={{
				position: 'absolute',
				width: 1080,
				height: 1080,
				left: 0,
				top: (height - width) * 0.35,
				scale: width / 1080,
				transformOrigin: 'top left',
			}}
		>
			<Interactive.Div
				name="Original Studio menus - camera"
				style={{
					position: 'absolute',
					width: 1080,
					height: 1080,
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: 0.8,
				}}
			>
				<AbsoluteFill
					name="Original Studio capture and cursor - 2x"
					trimBefore={(147 / 60) * fps}
					playbackRate={2}
					style={{
						width: 2330,
						height: 1440,
						left: interpolate(frame, [0, 190], [150, -1600], {
							easing: Easing.bezier(0.33, 0, 0.67, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						top: 90,
						scale: 1.5,
						transformOrigin: 'top left',
					}}
				>
					<ExploreStudioRecording20261027Composition />
				</AbsoluteFill>
			</Interactive.Div>
		</div>
	);
};

const StudioHomepageRenderContent = () => {
	const {fps, width, height} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				width: 1080,
				height: 1080,
				left: 0,
				top: (height - width) * 0.5,
				scale: width / 1080,
				transformOrigin: 'top left',
			}}
		>
			<AbsoluteFill
				name="Original render controls and cursor - 2x"
				trimBefore={0.4 * fps}
				playbackRate={2}
				style={{left: -420, width: 1920, height: 1080}}
			>
				<RenderModalCodecPreview />
			</AbsoluteFill>
		</div>
	);
};

const StudioHomepageKeyframesContent = () => {
	const {fps, width, height} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				width: 1080,
				height: 1080,
				left: 0,
				top: (height - width) * 0.8,
				scale: width / 1080,
				transformOrigin: 'top left',
			}}
		>
			<Interactive.Div
				name="Original keyframes - camera"
				style={{
					position: 'absolute',
					width: 1080,
					height: 1080,
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: 1.02,
				}}
			>
				<AbsoluteFill
					name="Original keyframe capture and cursor - 2x"
					trimBefore={(200 / 60) * fps}
					playbackRate={2}
					style={{
						width: 2194,
						height: 1438,
						left: -930,
						top: -165,
						scale: 1.05,
						transformOrigin: 'top left',
					}}
				>
					<ExploreKeyframesRecording20261027Composition />
				</AbsoluteFill>
			</Interactive.Div>
		</div>
	);
};

const StudioHomepageEffectsContent = () => {
	const {fps, width, height} = useVideoConfig();

	return (
		<Interactive.Div
			name="Original effects toggles - fixed camera"
			style={{
				position: 'absolute',
				width: 1568,
				height: 1440,
				left: '50%',
				top: '50%',
				translate: '-620px -660px',
				transformOrigin: '620px 660px',
				rotate: EXPLORE_CAMERA_ANGLE,
				scale: 1.65 * Math.min(width / 2560, height / 1600),
			}}
		>
			<AbsoluteFill
				name="Enable all four effects - one downward sweep"
				trimBefore={(236 / 60) * fps}
				durationInFrames={(118 / 60) * fps}
				playbackRate={59 / 25}
			>
				<EffectsRecordingComposition />
			</AbsoluteFill>
		</Interactive.Div>
	);
};

const StudioHomepageNewContent = () => {
	const {fps, width, height} = useVideoConfig();

	return (
		<Interactive.Div
			name="Original remotion.new Actions menu - camera"
			style={{
				position: 'absolute',
				width: 2418,
				height: 1440,
				left: '50%',
				top: '50%',
				translate: '-1100px -720px',
				transformOrigin: '1100px 720px',
				rotate: EXPLORE_CAMERA_ANGLE,
				scale: 1.05 * Math.min(width / 2560, height / 1600),
			}}
		>
			<AbsoluteFill
				name="Move down through the remotion.new actions"
				trimBefore={(159 / 60) * fps}
				durationInFrames={(118 / 60) * fps}
				playbackRate={59 / 38}
			>
				<ExploreNewRecording20261028Composition />
			</AbsoluteFill>
		</Interactive.Div>
	);
};

export const StudioHomepageMenus = Interactive.create({
	Component: StudioHomepageMenusContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const StudioHomepageRender = Interactive.create({
	Component: StudioHomepageRenderContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const StudioHomepageKeyframes = Interactive.create({
	Component: StudioHomepageKeyframesContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const StudioHomepageEffects = Interactive.create({
	Component: StudioHomepageEffectsContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const StudioHomepageNew = Interactive.create({
	Component: StudioHomepageNewContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

const StudioHomepageElementsContent = () => {
	const {fps, width, height} = useVideoConfig();

	return (
		<Interactive.Div
			name="Original Elements drop - camera"
			style={{
				position: 'absolute',
				width: 2402,
				height: 1600,
				left: '50%',
				top: '50%',
				translate: '-1200px -800px',
				transformOrigin: '1200px 800px',
				rotate: EXPLORE_CAMERA_ANGLE,
				scale: 1.05 * Math.min(width / 2560, height / 1600),
			}}
		>
			<AbsoluteFill
				name="Drop the element onto the canvas"
				trimBefore={(132 / 60) * fps}
				durationInFrames={(50 / 60) * fps}
				playbackRate={25 / 9}
			>
				<ExploreElementsRecording20261027Composition
					cursorFrame={null}
					showDragPreview
				/>
			</AbsoluteFill>
			<AbsoluteFill
				name="Installed element animating"
				from={(9 / 30) * fps}
				trimBefore={(356 / 60) * fps}
				durationInFrames={(56 / 60) * fps}
				playbackRate={4}
			>
				<ExploreElementsRecording20261027Composition
					cursorFrame={182}
					showDragPreview={false}
				/>
			</AbsoluteFill>
		</Interactive.Div>
	);
};

const StudioHomepageTransitionsContent = () => {
	const {fps, width, height} = useVideoConfig();

	return (
		<Interactive.Div
			name="Original A-to-B transition - camera"
			style={{
				position: 'absolute',
				width: 2896,
				height: 1842,
				left: '50%',
				top: '50%',
				translate: '-1448px -860px',
				transformOrigin: '1448px 860px',
				rotate: EXPLORE_CAMERA_ANGLE,
				scale: 0.9 * Math.min(width / 2560, height / 1600),
			}}
		>
			<AbsoluteFill
				name="Zoom blur transition from A to B"
				trimBefore={(156 / 60) * fps}
				durationInFrames={(84 / 60) * fps}
				playbackRate={42 / 16}
			>
				<ExploreZoomBlurRecording20261028Composition />
			</AbsoluteFill>
		</Interactive.Div>
	);
};

const StudioHomepageParameterizationContent = () => {
	const {fps, width, height} = useVideoConfig();

	return (
		<Interactive.Div
			name="Original duration parameter - camera"
			style={{
				position: 'absolute',
				width: 2032,
				height: 1440,
				left: '50%',
				top: '50%',
				translate: '-1250px -770px',
				transformOrigin: '1250px 770px',
				rotate: EXPLORE_CAMERA_ANGLE,
				scale: 1.6 * Math.min(width / 2560, height / 1600),
			}}
		>
			<AbsoluteFill
				name="Drag durationInFrames"
				trimBefore={(417 / 60) * fps}
				durationInFrames={(16 / 30) * fps * 4.4}
				playbackRate={4.4}
			>
				<ParameterizationRecordingComposition />
			</AbsoluteFill>
		</Interactive.Div>
	);
};

export const StudioHomepageElements = Interactive.create({
	Component: StudioHomepageElementsContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const StudioHomepageTransitions = Interactive.create({
	Component: StudioHomepageTransitionsContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const StudioHomepageParameterization = Interactive.create({
	Component: StudioHomepageParameterizationContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
