import {Video} from '@remotion/media';
import {AbsoluteFill, HtmlInCanvas, Sequence} from 'remotion';
import {ExploreEditorStarterRecording20261027Composition} from '../../ExploreEditorStarterRecording20261027Composition';

export const editorStarterDuration = 239;

export const EditorStarterRecordingEdit = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#27272b', overflow: 'visible'}}>
			<Sequence
				durationInFrames={230}
				layout="none"
				name="Move the clip and adjust its curve"
			>
				<Sequence from={-46} layout="none">
					<ExploreEditorStarterRecording20261027Composition />
				</Sequence>
			</Sequence>
			{/* Source frames 276–278 briefly hide the curve handles on release. */}
			<Sequence
				from={230}
				durationInFrames={9}
				layout="none"
				name="Settled curve"
			>
				<Sequence from={-279} layout="none">
					<ExploreEditorStarterRecording20261027Composition />
				</Sequence>
			</Sequence>
		</AbsoluteFill>
	);
};

export const ExploreRemotionEditorStarter = () => {
	return (
		<HtmlInCanvas
			name="Editor Starter timeline"
			width={1080}
			height={1080}
			durationInFrames={editorStarterDuration}
		>
			<div
				style={{
					position: 'relative',
					width: 1080,
					height: 1080,
					backgroundColor: '#27272b',
					overflow: 'visible',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						overflow: 'visible',
						rotate: '0.904608 0.351506 -0.241096 27.995464deg',
					}}
				>
					<Video
						name="Pre-composed Editor Starter interaction"
						src="https://remotion.media/explore-remotion/editor-starter-interaction-precomp-2026-10-27-88926bd0c32f.mp4"
						muted
						durationInFrames={editorStarterDuration}
						style={{
							position: 'absolute',
							left: -835,
							top: -586,
							width: 1308,
							height: 896,
							scale: 2.2,
							transformOrigin: 'top left',
						}}
					/>
				</div>
			</div>
		</HtmlInCanvas>
	);
};
