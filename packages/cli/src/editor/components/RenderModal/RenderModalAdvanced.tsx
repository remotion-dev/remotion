import type {Codec, PixelFormat, StillImageFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ChangeEvent} from 'react';
import React, {useCallback, useMemo} from 'react';
import type {TComposition} from 'remotion';
import {Checkmark} from '../../icons/Checkmark';

import {Checkbox} from '../Checkbox';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {RemotionInput} from '../NewComposition/RemInput';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {FrameRangeSetting} from './FrameRangeSetting';
import {input, label, optionRow, rightRow} from './layout';
import {NumberOfLoopsSetting} from './NumberOfLoopsSetting';
import {NumberSetting} from './NumberSetting';
import {QualitySetting} from './QualitySetting';
import {ScaleSetting} from './ScaleSetting';

export type RenderType = 'still' | 'video' | 'audio';

const qualityControlModes = ['crf', 'bitrate'] as const;
export type QualityControl = typeof qualityControlModes[number];

export const RenderModalAdvanced: React.FC<{
	codec: Codec;
	everyNthFrame: number;
	setEveryNthFrameSetting: React.Dispatch<React.SetStateAction<number>>;
	limitNumberOfGifLoops: boolean;
	setLimitNumberOfGifLoops: (value: React.SetStateAction<boolean>) => void;
	numberOfGifLoopsSetting: number;
	setNumberOfGifLoopsSetting: React.Dispatch<React.SetStateAction<number>>;
	renderMode: RenderType;
	minConcurrency: number;
	maxConcurrency: number;
	setConcurrency: React.Dispatch<React.SetStateAction<number>>;
	concurrency: number;
	scale: number;
	setScale: React.Dispatch<React.SetStateAction<number>>;
	imageFormatOptions: SegmentedControlItem[];
	pixelFormat: PixelFormat;
	setPixelFormat: React.Dispatch<React.SetStateAction<PixelFormat>>;
	setQualityControl: React.Dispatch<React.SetStateAction<QualityControl>>;
	qualityControlType: QualityControl;
	videoImageFormat: StillImageFormat;
	setQuality: React.Dispatch<React.SetStateAction<number>>;
	quality: number;
	muted: boolean;
	setMuted: React.Dispatch<React.SetStateAction<boolean>>;
	maxCrf: number;
	minCrf: number;
	setCrf: React.Dispatch<React.SetStateAction<number>>;
	shouldDisplayCrfOption: boolean;
	setVerboseLogging: React.Dispatch<React.SetStateAction<boolean>>;
	setEndFrame: React.Dispatch<React.SetStateAction<number | null>>;
	setCustomTargetVideoBitrateValue: React.Dispatch<
		React.SetStateAction<string>
	>;
	customTargetVideoBitrate: string;
	crf: number;
	verbose: boolean;
	startFrame: number;
	currentComposition: TComposition<unknown>;
	endFrame: number;
	setStartFrame: React.Dispatch<React.SetStateAction<number | null>>;
}> = ({
	codec,
	everyNthFrame,
	setEveryNthFrameSetting,
	setLimitNumberOfGifLoops,
	limitNumberOfGifLoops,
	renderMode,
	numberOfGifLoopsSetting,
	setNumberOfGifLoopsSetting,
	maxConcurrency,
	minConcurrency,
	setConcurrency,
	concurrency,
	scale,
	setScale,
	imageFormatOptions,
	pixelFormat,
	setPixelFormat,
	setQualityControl,
	qualityControlType,
	videoImageFormat,
	setQuality,
	quality,
	maxCrf,
	minCrf,
	setCrf,
	shouldDisplayCrfOption,
	setEndFrame,
	setVerboseLogging,
	setCustomTargetVideoBitrateValue,
	customTargetVideoBitrate,
	crf,
	verbose,
	startFrame,
	currentComposition,
	endFrame,
	setStartFrame,
}) => {
	const onShouldLimitNumberOfGifLoops = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setLimitNumberOfGifLoops(e.target.checked);
		},
		[setLimitNumberOfGifLoops]
	);
	const pixelFormatOptions = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.validPixelFormats.map((option) => {
			return {
				label: option,
				onClick: () => setPixelFormat(option),
				key: option,
				id: option,
				keyHint: null,
				leftItem: pixelFormat === option ? <Checkmark /> : null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: option,
			};
		});
	}, [pixelFormat, setPixelFormat]);

	const qualityControlOptions = useMemo((): SegmentedControlItem[] => {
		return qualityControlModes.map((option) => {
			return {
				label: option === 'crf' ? 'CRF' : 'Bitrate',
				onClick: () => setQualityControl(option),
				key: option,
				selected: qualityControlType === option,
			};
		});
	}, [qualityControlType, setQualityControl]);

	const onVerboseLoggingChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setVerboseLogging(e.target.checked);
		},
		[setVerboseLogging]
	);

	const onTargetVideoBitrateChanged: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setCustomTargetVideoBitrateValue(e.target.value);
			},
			[setCustomTargetVideoBitrateValue]
		);

	return (
		<div>
			{codec === 'gif' ? (
				<NumberSetting
					name="Every nth frame"
					min={1}
					onValueChanged={setEveryNthFrameSetting}
					value={everyNthFrame}
					step={1}
				/>
			) : null}
			{codec === 'gif' ? (
				<div style={optionRow}>
					<div style={label}>Limit GIF loops</div>
					<div style={rightRow}>
						<Checkbox
							checked={limitNumberOfGifLoops}
							onChange={onShouldLimitNumberOfGifLoops}
						/>
					</div>
				</div>
			) : null}
			{codec === 'gif' && limitNumberOfGifLoops ? (
				<NumberOfLoopsSetting
					numberOfGifLoops={numberOfGifLoopsSetting}
					setNumberOfGifLoops={setNumberOfGifLoopsSetting}
				/>
			) : null}
			{renderMode === 'still' ? null : (
				<NumberSetting
					min={minConcurrency}
					max={maxConcurrency}
					step={1}
					name="Concurrency"
					onValueChanged={setConcurrency}
					value={concurrency}
				/>
			)}
			{renderMode === 'video' ? (
				<ScaleSetting scale={scale} setScale={setScale} />
			) : null}
			{renderMode === 'video' ? (
				<div style={optionRow}>
					<div style={label}>Image Format</div>
					<div style={rightRow}>
						<SegmentedControl
							items={imageFormatOptions}
							needsWrapping={false}
						/>
					</div>
				</div>
			) : null}
			{renderMode === 'video' ? (
				<div style={optionRow}>
					<div style={label}>Pixel format</div>
					<div style={rightRow}>
						<Combobox
							values={pixelFormatOptions}
							selectedId={pixelFormat}
							title="Pixel Format"
						/>
					</div>
				</div>
			) : null}
			{renderMode === 'video' && videoImageFormat === 'jpeg' && (
				<QualitySetting setQuality={setQuality} quality={quality} />
			)}
			{renderMode === 'video' ? (
				<div style={optionRow}>
					<div style={label}>Quality control</div>
					<div style={rightRow}>
						<SegmentedControl items={qualityControlOptions} needsWrapping />
					</div>
				</div>
			) : null}
			{shouldDisplayCrfOption &&
			qualityControlType === 'crf' &&
			renderMode !== 'still' ? (
				<NumberSetting
					min={minCrf}
					max={maxCrf}
					name="CRF"
					onValueChanged={setCrf}
					value={crf}
					step={1}
				/>
			) : null}
			{qualityControlType === 'bitrate' && renderMode !== 'still' ? (
				<div style={optionRow}>
					<div style={label}>Target video bitrate</div>
					<div style={rightRow}>
						<div>
							<RemotionInput
								style={input}
								value={customTargetVideoBitrate}
								onChange={onTargetVideoBitrateChanged}
							/>
						</div>
					</div>
				</div>
			) : null}

			{renderMode === 'still' ? null : (
				<FrameRangeSetting
					durationInFrames={currentComposition.durationInFrames}
					endFrame={endFrame}
					setEndFrame={setEndFrame}
					setStartFrame={setStartFrame}
					startFrame={startFrame}
				/>
			)}
			<div style={optionRow}>
				<div style={label}>Verbose logging</div>
				<div style={rightRow}>
					<Checkbox checked={verbose} onChange={onVerboseLoggingChanged} />
				</div>
			</div>
		</div>
	);
};
