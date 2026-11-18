import {Audio, Video} from '@remotion/media';
import {Composition, Folder} from 'remotion';
import {MotionBlurAdjustment} from './MotionBlurAdjustment';
import {MotionBlurAgentPrompt} from './MotionBlurAgentPrompt';
import {MotionBlurClick} from './MotionBlurClick';
import {MotionBlurClickCaptureComposition} from './MotionBlurClickCapture';
import {MotionBlurCodeCloseup} from './MotionBlurCodeCloseup';
import {MotionBlurCopyContext} from './MotionBlurCopyContext';
import {MotionBlurDocumentation} from './MotionBlurDocumentation';
import {MotionBlurEditorCaptureComposition} from './MotionBlurEditorCapture';
import {MotionBlurFrameBlending} from './MotionBlurFrameBlending';
import {MotionBlurScrub} from './MotionBlurScrub';
import {MotionBlurScrubCaptureComposition} from './MotionBlurScrubCaptureComposition';
import {MotionBlurSelect} from './MotionBlurSelect';
import {MotionBlurSelectCaptureComposition} from './MotionBlurSelectCaptureComposition';
import {MotionBlurShort, motionBlurShortSchema} from './MotionBlurShort';
import {RemotionTriangleMotionBlur} from './RemotionTriangleMotionBlur';

const SourceTake = ({
	src,
	audioSrc,
}: {
	readonly src: string;
	readonly audioSrc: string;
}) => {
	return (
		<>
			<Video
				name="Source footage"
				src={src}
				muted
				objectFit="contain"
				style={{width: '100%', height: '100%'}}
			/>
			<Audio name="Dialogue" src={audioSrc} />
		</>
	);
};

export const MotionBlurCompositions = () => {
	return (
		<Folder name="MotionBlur">
			<Composition
				id="RemotionTriangleMotionBlur"
				component={RemotionTriangleMotionBlur}
				durationInFrames={96}
				fps={30}
				width={1080}
				height={960}
			/>
			<Composition
				id="MotionBlurShort"
				component={MotionBlurShort}
				schema={motionBlurShortSchema}
				defaultProps={{format: 'portrait' as const}}
				calculateMetadata={({props}) => ({
					width: props.format === 'portrait' ? 1080 : 1920,
					height: props.format === 'portrait' ? 1920 : 1080,
				})}
				durationInFrames={1307}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="MotionBlurScrub"
				component={MotionBlurScrub}
				durationInFrames={87}
				fps={30}
				width={1080}
				height={960}
			/>
			<Composition
				id="MotionBlurFrameBlending"
				component={MotionBlurFrameBlending}
				durationInFrames={233}
				fps={30}
				width={1080}
				height={960}
			/>
			<Composition
				id="MotionBlurCodeCloseup"
				component={MotionBlurCodeCloseup}
				durationInFrames={79}
				fps={30}
				width={1080}
				height={960}
			/>
			<Composition
				id="MotionBlurDocumentation"
				component={MotionBlurDocumentation}
				durationInFrames={159}
				fps={30}
				width={1080}
				height={960}
			/>
			<Composition
				id="MotionBlurAgentPrompt"
				component={MotionBlurAgentPrompt}
				durationInFrames={81}
				fps={30}
				width={940}
				height={622}
				defaultProps={{
					pastedContext:
						'Triangle motion blur\nRemotionTriangleMotionBlur.tsx:30',
					prompt: 'add motion blur to this',
					pasteFrame: 8,
					typingStartFrame: 30,
					typingDurationInFrames: 40,
					style: {width: 940, height: 622, backgroundColor: '#ffffff'},
				}}
			/>
			<Composition
				id="MotionBlurCopyContext"
				component={MotionBlurCopyContext}
				durationInFrames={38}
				fps={30}
				width={1080}
				height={960}
				defaultProps={{
					style: {backgroundColor: '#1f2427', overflow: 'hidden'},
				}}
			/>
			<Composition
				id="MotionBlurAdjustment"
				component={MotionBlurAdjustment}
				durationInFrames={105}
				fps={30}
				width={1080}
				height={960}
			/>
			<Composition
				id="MotionBlurSelect"
				component={MotionBlurSelect}
				durationInFrames={87}
				fps={30}
				width={1080}
				height={960}
			/>
			<Composition
				id="MotionBlurClick"
				component={MotionBlurClick}
				durationInFrames={55}
				fps={30}
				width={1080}
				height={960}
			/>
			<Folder name="Source-captures">
				<Composition
					id="MotionBlurScrubCapture"
					component={MotionBlurScrubCaptureComposition}
					durationInFrames={460}
					fps={30}
					width={1904}
					height={1440}
				/>
				<Composition
					id="MotionBlurClickCapture"
					component={MotionBlurClickCaptureComposition}
					durationInFrames={426}
					fps={30}
					width={1262}
					height={1184}
				/>
				<Composition
					id="MotionBlurEditorCapture"
					component={MotionBlurEditorCaptureComposition}
					durationInFrames={447}
					fps={30}
					width={3742}
					height={1966}
				/>
				<Composition
					id="MotionBlurSelectCapture"
					component={MotionBlurSelectCaptureComposition}
					durationInFrames={206}
					fps={30}
					width={1572}
					height={1440}
				/>
			</Folder>
			<Folder name="Source-takes">
				<Composition
					id="MotionBlurTake01"
					component={SourceTake}
					durationInFrames={582}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						src: 'https://remotion.media/motion-blur-2026-11-17/motionblur1-c3b31409c4f7.mov',
						audioSrc:
							'https://remotion.media/motion-blur-2026-11-17/motionblur1-auphonic-f5707c0628bc.flac',
					}}
				/>
				<Composition
					id="MotionBlurTake02"
					component={SourceTake}
					durationInFrames={429}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						src: 'https://remotion.media/motion-blur-2026-11-17/motionblur2-877e2ac3e47a.mov',
						audioSrc:
							'https://remotion.media/motion-blur-2026-11-17/motionblur2-auphonic-35babfd50e39.flac',
					}}
				/>
				<Composition
					id="MotionBlurTake03"
					component={SourceTake}
					durationInFrames={317}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						src: 'https://remotion.media/motion-blur-2026-11-17/motionblur3-be5cefd51678.mov',
						audioSrc:
							'https://remotion.media/motion-blur-2026-11-17/motionblur3-auphonic-ca939e5d5769.flac',
					}}
				/>
				<Composition
					id="MotionBlurTake04"
					component={SourceTake}
					durationInFrames={273}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						src: 'https://remotion.media/motion-blur-2026-11-17/motionblur4-63f184179492.mov',
						audioSrc:
							'https://remotion.media/motion-blur-2026-11-17/motionblur4-auphonic-041ad03f19e2.flac',
					}}
				/>
				<Composition
					id="MotionBlurTake05"
					component={SourceTake}
					durationInFrames={463}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						src: 'https://remotion.media/motion-blur-2026-11-17/motionblur5-56ef839c3bc9.mov',
						audioSrc:
							'https://remotion.media/motion-blur-2026-11-17/motionblur5-auphonic-a1b798ab2831.flac',
					}}
				/>
				<Composition
					id="MotionBlurTake06"
					component={SourceTake}
					durationInFrames={308}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						src: 'https://remotion.media/motion-blur-2026-11-17/motionblur6-bfcb3ee8d79b.mov',
						audioSrc:
							'https://remotion.media/motion-blur-2026-11-17/motionblur6-auphonic-4b4e7dc94a41.flac',
					}}
				/>
			</Folder>
		</Folder>
	);
};
