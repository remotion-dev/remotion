import {Video} from '@remotion/media';
import {AbsoluteFill, Freeze, HtmlInCanvas, Sequence} from 'remotion';
import {ExploreElementsRecording20261027Composition} from '../../ExploreElementsRecording20261027Composition';

export const elementsDropDuration = 194;

export const ElementsDropEdit = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#1e2427', overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					width: 2402,
					height: 1600,
					left: -236,
					top: -187,
					scale: 0.92,
					transformOrigin: 'top left',
				}}
			>
				<Sequence
					durationInFrames={69}
					layout="none"
					name="Drop onto the canvas and apply"
				>
					<Freeze frame={50} active={(frame) => frame >= 51}>
						<Sequence from={-132} layout="none">
							<ExploreElementsRecording20261027Composition
								cursorFrame={null}
								showDragPreview
							/>
						</Sequence>
					</Freeze>
				</Sequence>
				<Sequence
					from={69}
					durationInFrames={125}
					layout="none"
					name="Installed element"
				>
					<Sequence from={-356} layout="none">
						<ExploreElementsRecording20261027Composition
							cursorFrame={182}
							showDragPreview={false}
						/>
					</Sequence>
				</Sequence>
			</div>
		</AbsoluteFill>
	);
};

export const ExploreRemotionElements = () => {
	return (
		<HtmlInCanvas
			name="Elements drop"
			width={1080}
			height={1080}
			durationInFrames={elementsDropDuration}
		>
			<div
				style={{
					position: 'relative',
					width: 1080,
					height: 1080,
					backgroundColor: '#1e2427',
				}}
			>
				<Video
					name="Pre-composed drop"
					src="https://remotion.media/explore-remotion/elements-drop-precomp-2026-10-27-8fd42660a9fe.mp4"
					durationInFrames={elementsDropDuration}
					muted
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: 1080,
						height: 1080,
						rotate: '0.12 1 -0.15 20deg',
						scale: 1.02,
					}}
				/>
			</div>
		</HtmlInCanvas>
	);
};
