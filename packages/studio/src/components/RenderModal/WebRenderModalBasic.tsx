import type {
	RenderStillImageFormat,
	WebRendererCodec,
	WebRendererContainer,
	WebRendererQuality,
} from '@remotion/web-renderer';
import type React from 'react';
import {useMemo} from 'react';
import type {VideoConfig} from 'remotion';
import {Spacing} from '../layout';
import {InputDragger} from '../NewComposition/InputDragger';
import {RightAlignInput} from '../NewComposition/RemInput';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import type {RenderType} from './WebRenderModal';
import {input, label, optionRow, rightRow} from './layout';
import {RenderModalOutputName} from './RenderModalOutputName';

type WebRenderModalBasicProps = {
	readonly renderMode: RenderType;
	readonly resolvedComposition: VideoConfig;
	readonly imageFormat: RenderStillImageFormat;
	readonly setStillFormat: (format: RenderStillImageFormat) => void;
	readonly frame: number;
	readonly onFrameChanged: (e: string) => void;
	readonly onFrameSetDirectly: (newFrame: number) => void;
	readonly container: WebRendererContainer;
	readonly setContainerFormat: (container: WebRendererContainer) => void;
	readonly codec: WebRendererCodec;
	readonly setCodec: (codec: WebRendererCodec) => void;
	readonly videoBitrate: WebRendererQuality;
	readonly setVideoBitrate: (quality: WebRendererQuality) => void;
	readonly startFrame: number | null;
	readonly setStartFrame: (frame: number | null) => void;
	readonly endFrame: number | null;
	readonly setEndFrame: (frame: number | null) => void;
	readonly outName: string;
	readonly onOutNameChange: React.ChangeEventHandler<HTMLInputElement>;
	readonly validationMessage: string | null;
	readonly existence: boolean | null;
};

const tabContainer: React.CSSProperties = {
	flex: 1,
};

export const WebRenderModalBasic: React.FC<WebRenderModalBasicProps> = ({
	renderMode,
	resolvedComposition,
	imageFormat,
	setStillFormat,
	frame,
	onFrameChanged,
	onFrameSetDirectly,
	container,
	setContainerFormat,
	codec,
	setCodec,
	videoBitrate,
	setVideoBitrate,
	startFrame,
	setStartFrame,
	endFrame,
	setEndFrame,
	outName,
	onOutNameChange,
	validationMessage,
	existence,
}) => {
	const imageFormatOptions = useMemo((): SegmentedControlItem[] => {
		return [
			{
				label: 'PNG',
				onClick: () => setStillFormat('png'),
				key: 'png',
				selected: imageFormat === 'png',
			},
			{
				label: 'JPEG',
				onClick: () => setStillFormat('jpeg'),
				key: 'jpeg',
				selected: imageFormat === 'jpeg',
			},
			{
				label: 'WebP',
				onClick: () => setStillFormat('webp'),
				key: 'webp',
				selected: imageFormat === 'webp',
			},
		];
	}, [imageFormat, setStillFormat]);

	const containerOptions = useMemo((): SegmentedControlItem[] => {
		return [
			{
				label: 'MP4',
				onClick: () => setContainerFormat('mp4'),
				key: 'mp4',
				selected: container === 'mp4',
			},
			{
				label: 'WebM',
				onClick: () => setContainerFormat('webm'),
				key: 'webm',
				selected: container === 'webm',
			},
		];
	}, [container, setContainerFormat]);

	const codecOptions = useMemo((): SegmentedControlItem[] => {
		if (container === 'mp4') {
			return [
				{
					label: 'H.264',
					onClick: () => setCodec('h264'),
					key: 'h264',
					selected: codec === 'h264',
				},
				{
					label: 'H.265',
					onClick: () => setCodec('h265'),
					key: 'h265',
					selected: codec === 'h265',
				},
			];
		}

		return [
			{
				label: 'VP8',
				onClick: () => setCodec('vp8'),
				key: 'vp8',
				selected: codec === 'vp8',
			},
			{
				label: 'VP9',
				onClick: () => setCodec('vp9'),
				key: 'vp9',
				selected: codec === 'vp9',
			},
			{
				label: 'AV1',
				onClick: () => setCodec('av1'),
				key: 'av1',
				selected: codec === 'av1',
			},
		];
	}, [container, codec, setCodec]);

	const qualityOptions = useMemo((): SegmentedControlItem[] => {
		return [
			{
				label: 'Very Low',
				onClick: () => setVideoBitrate('very-low'),
				key: 'very-low',
				selected: videoBitrate === 'very-low',
			},
			{
				label: 'Low',
				onClick: () => setVideoBitrate('low'),
				key: 'low',
				selected: videoBitrate === 'low',
			},
			{
				label: 'Medium',
				onClick: () => setVideoBitrate('medium'),
				key: 'medium',
				selected: videoBitrate === 'medium',
			},
			{
				label: 'High',
				onClick: () => setVideoBitrate('high'),
				key: 'high',
				selected: videoBitrate === 'high',
			},
			{
				label: 'Very High',
				onClick: () => setVideoBitrate('very-high'),
				key: 'very-high',
				selected: videoBitrate === 'very-high',
			},
		];
	}, [videoBitrate, setVideoBitrate]);

	return (
		<div style={tabContainer}>
			{renderMode === 'still' ? (
				<>
					<div style={optionRow}>
						<div style={label}>Format</div>
						<div style={rightRow}>
							<SegmentedControl items={imageFormatOptions} needsWrapping />
						</div>
					</div>
					{resolvedComposition.durationInFrames > 1 ? (
						<div style={optionRow}>
							<div style={label}>Frame</div>
							<div style={rightRow}>
								<RightAlignInput>
									<InputDragger
										value={frame}
										onTextChange={onFrameChanged}
										placeholder={`0-${resolvedComposition.durationInFrames - 1}`}
										onValueChange={onFrameSetDirectly}
										name="frame"
										step={1}
										min={0}
										status="ok"
										max={resolvedComposition.durationInFrames - 1}
										rightAlign
									/>
								</RightAlignInput>
							</div>
						</div>
					) : null}
				</>
			) : (
				<>
					<div style={optionRow}>
						<div style={label}>Container</div>
						<div style={rightRow}>
							<SegmentedControl items={containerOptions} needsWrapping />
						</div>
					</div>
					<div style={optionRow}>
						<div style={label}>Codec</div>
						<div style={rightRow}>
							<SegmentedControl items={codecOptions} needsWrapping />
						</div>
					</div>
					<div style={optionRow}>
						<div style={label}>Quality</div>
						<div style={rightRow}>
							<SegmentedControl items={qualityOptions} needsWrapping />
						</div>
					</div>
					<div style={optionRow}>
						<div style={label}>Start Frame</div>
						<Spacing x={0.5} />
						<div style={rightRow}>
							<RightAlignInput>
								<InputDragger
									value={startFrame ?? 0}
									onTextChange={(e) => {
										const val = parseFloat(e);
										setStartFrame(Number.isNaN(val) ? null : val);
									}}
									placeholder="0"
									onValueChange={(val) => setStartFrame(val)}
									name="start-frame"
									step={1}
									min={0}
									status="ok"
									max={resolvedComposition.durationInFrames - 1}
									rightAlign
								/>
							</RightAlignInput>
						</div>
					</div>
					<div style={optionRow}>
						<div style={label}>End Frame</div>
						<Spacing x={0.5} />
						<div style={rightRow}>
							<RightAlignInput>
								<InputDragger
									value={endFrame ?? resolvedComposition.durationInFrames - 1}
									onTextChange={(e) => {
										const val = parseFloat(e);
										setEndFrame(Number.isNaN(val) ? null : val);
									}}
									placeholder={`${resolvedComposition.durationInFrames - 1}`}
									onValueChange={(val) => setEndFrame(val)}
									name="end-frame"
									step={1}
									min={0}
									status="ok"
									max={resolvedComposition.durationInFrames - 1}
									rightAlign
								/>
							</RightAlignInput>
						</div>
					</div>
				</>
			)}
			<RenderModalOutputName
				existence={existence ?? false}
				inputStyle={input}
				outName={outName}
				onValueChange={onOutNameChange}
				validationMessage={validationMessage}
				label="Download name"
			/>
		</div>
	);
};
