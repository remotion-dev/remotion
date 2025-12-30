import type {LogLevel} from '@remotion/renderer';
import type {
	RenderStillOnWebImageFormat,
	WebRendererContainer,
	WebRendererVideoCodec,
} from '@remotion/web-renderer';
import type React from 'react';
import {useMemo} from 'react';
import type {VideoConfig} from 'remotion';
import {Checkmark} from '../../icons/Checkmark';
import {Spacing} from '../layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {InputDragger} from '../NewComposition/InputDragger';
import {RightAlignInput} from '../NewComposition/RemInput';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {FrameRangeSetting} from './FrameRangeSetting';
import {humanReadableLogLevel} from './human-readable-loglevel';
import {input, label, optionRow, rightRow} from './layout';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import {RenderModalOutputName} from './RenderModalOutputName';
import type {RenderType} from './WebRenderModal';

type WebRenderModalBasicProps = {
	readonly renderMode: RenderType;
	readonly resolvedComposition: VideoConfig;
	readonly imageFormat: RenderStillOnWebImageFormat;
	readonly setStillFormat: (format: RenderStillOnWebImageFormat) => void;
	readonly frame: number;
	readonly onFrameChanged: (e: string) => void;
	readonly onFrameSetDirectly: (newFrame: number) => void;
	readonly container: WebRendererContainer;
	readonly setContainerFormat: (container: WebRendererContainer) => void;
	readonly codec: WebRendererVideoCodec;
	readonly setCodec: (codec: WebRendererVideoCodec) => void;
	readonly startFrame: number | null;
	readonly setStartFrame: React.Dispatch<React.SetStateAction<number | null>>;
	readonly endFrame: number | null;
	readonly setEndFrame: React.Dispatch<React.SetStateAction<number | null>>;
	readonly outName: string;
	readonly onOutNameChange: React.ChangeEventHandler<HTMLInputElement>;
	readonly validationMessage: string | null;
	readonly logLevel: LogLevel;
	readonly setLogLevel: (level: LogLevel) => void;
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
	startFrame,
	setStartFrame,
	endFrame,
	setEndFrame,
	outName,
	onOutNameChange,
	validationMessage,
	logLevel,
	setLogLevel,
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

	const logLevelOptions = useMemo((): ComboboxValue[] => {
		return (['trace', 'verbose', 'info', 'warn', 'error'] as const).map(
			(level): ComboboxValue => {
				return {
					label: humanReadableLogLevel(level),
					onClick: () => setLogLevel(level),
					leftItem: logLevel === level ? <Checkmark /> : null,
					id: level,
					keyHint: null,
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item',
					value: level,
				};
			},
		);
	}, [logLevel, setLogLevel]);

	const containerOptions = useMemo((): ComboboxValue[] => {
		return [
			{
				label: 'MP4',
				onClick: () => setContainerFormat('mp4'),
				leftItem: container === 'mp4' ? <Checkmark /> : null,
				id: 'mp4',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'mp4',
			},
			{
				label: 'WebM',
				onClick: () => setContainerFormat('webm'),
				leftItem: container === 'webm' ? <Checkmark /> : null,
				id: 'webm',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'webm',
			},
		];
	}, [container, setContainerFormat]);

	const codecOptions = useMemo((): ComboboxValue[] => {
		return [
			{
				label: 'H.264',
				onClick: () => setCodec('h264'),
				leftItem: codec === 'h264' ? <Checkmark /> : null,
				id: 'h264',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'h264',
			},
			{
				label: 'H.265',
				onClick: () => setCodec('h265'),
				leftItem: codec === 'h265' ? <Checkmark /> : null,
				id: 'h265',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'h265',
			},
			{
				label: 'VP8',
				onClick: () => setCodec('vp8'),
				leftItem: codec === 'vp8' ? <Checkmark /> : null,
				id: 'vp8',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'vp8',
			},
			{
				label: 'VP9',
				onClick: () => setCodec('vp9'),
				leftItem: codec === 'vp9' ? <Checkmark /> : null,
				id: 'vp9',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'vp9',
			},
			{
				label: 'AV1',
				onClick: () => setCodec('av1'),
				leftItem: codec === 'av1' ? <Checkmark /> : null,
				id: 'av1',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'av1',
			},
		];
	}, [codec, setCodec]);

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
							<Combobox
								values={containerOptions}
								selectedId={container}
								title="Container"
							/>
						</div>
					</div>
					<div style={optionRow}>
						<div style={label}>
							Codec
							<Spacing x={0.5} />
							<OptionExplainerBubble id="videoCodecOption" />
						</div>
						<div style={rightRow}>
							<Combobox
								values={codecOptions}
								selectedId={codec}
								title="Codec"
							/>
						</div>
					</div>
					<FrameRangeSetting
						durationInFrames={resolvedComposition.durationInFrames}
						startFrame={startFrame ?? 0}
						endFrame={endFrame ?? resolvedComposition.durationInFrames - 1}
						setStartFrame={setStartFrame}
						setEndFrame={setEndFrame}
					/>
				</>
			)}
			<RenderModalOutputName
				existence={false}
				inputStyle={input}
				outName={outName}
				onValueChange={onOutNameChange}
				validationMessage={validationMessage}
				label="Download name"
			/>
			<div style={optionRow}>
				<div style={label}>
					Log Level <Spacing x={0.5} />
					<OptionExplainerBubble id="logLevelOption" />
				</div>
				<div style={rightRow}>
					<Combobox
						values={logLevelOptions}
						selectedId={logLevel}
						title="Log Level"
					/>
				</div>
			</div>
		</div>
	);
};
