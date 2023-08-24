import type {
	PixelFormat,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import React, {useCallback, useMemo} from 'react';
import {Checkmark} from '../../icons/Checkmark';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {RemotionInput} from '../NewComposition/RemInput';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {CrfSetting} from './CrfSetting';
import {InfoBubble} from './InfoBubble';
import {JpegQualitySetting} from './JpegQualitySetting';
import {input, label, optionRow, rightRow} from './layout';
import {OptionExplainer} from './OptionExplainer';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalHr} from './RenderModalHr';
import {ScaleSetting} from './ScaleSetting';

const qualityControlModes = ['crf', 'bitrate'] as const;
export type QualityControl = (typeof qualityControlModes)[number];

const container: React.CSSProperties = {
	flex: 1,
};

export const RenderModalPicture: React.FC<{
	renderMode: RenderType;
	scale: number;
	setScale: React.Dispatch<React.SetStateAction<number>>;
	pixelFormat: PixelFormat;
	setPixelFormat: React.Dispatch<React.SetStateAction<PixelFormat>>;
	imageFormatOptions: SegmentedControlItem[];
	setQualityControl: React.Dispatch<React.SetStateAction<QualityControl>>;
	qualityControlType: QualityControl | null;
	videoImageFormat: VideoImageFormat;
	stillImageFormat: StillImageFormat;
	setJpegQuality: React.Dispatch<React.SetStateAction<number>>;
	jpegQuality: number;
	maxCrf: number;
	minCrf: number;
	setCrf: React.Dispatch<React.SetStateAction<number>>;
	setCustomTargetVideoBitrateValue: React.Dispatch<
		React.SetStateAction<string>
	>;
	crf: number;
	customTargetVideoBitrate: string;
	shouldDisplayQualityControlPicker: boolean;
}> = ({
	renderMode,
	scale,
	setScale,
	pixelFormat,
	setPixelFormat,
	imageFormatOptions,
	setQualityControl,
	qualityControlType,
	videoImageFormat,
	setJpegQuality,
	jpegQuality,
	maxCrf,
	minCrf,
	setCrf,
	shouldDisplayQualityControlPicker,
	setCustomTargetVideoBitrateValue,
	crf,
	customTargetVideoBitrate,
	stillImageFormat,
}) => {
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

	const onTargetVideoBitrateChanged: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setCustomTargetVideoBitrateValue(e.target.value);
			},
			[setCustomTargetVideoBitrateValue],
		);

	return (
		<div style={container}>
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
			{renderMode === 'video' && videoImageFormat === 'jpeg' && (
				<JpegQualitySetting
					jpegQuality={jpegQuality}
					setJpegQuality={setJpegQuality}
				/>
			)}
			{renderMode === 'still' && stillImageFormat === 'jpeg' && (
				<JpegQualitySetting
					jpegQuality={jpegQuality}
					setJpegQuality={setJpegQuality}
				/>
			)}
			{renderMode === 'video' && qualityControlType !== null ? (
				<RenderModalHr />
			) : null}
			{shouldDisplayQualityControlPicker && renderMode === 'video' ? (
				<div style={optionRow}>
					<div style={label}>Quality control</div>

					<div style={rightRow}>
						<SegmentedControl items={qualityControlOptions} needsWrapping />
					</div>
				</div>
			) : null}
			{qualityControlType === 'crf' && renderMode !== 'still' ? (
				<CrfSetting
					crf={crf}
					min={minCrf}
					max={maxCrf}
					setCrf={setCrf}
					option={BrowserSafeApis.options.crfOption}
				/>
			) : null}
			{qualityControlType === 'bitrate' && renderMode !== 'still' ? (
				<div style={optionRow}>
					<div style={label}>
						Target video bitrate
						<InfoBubble title="Learn more about this option">
							<OptionExplainer option={BrowserSafeApis.options.videoBitrate} />
						</InfoBubble>
					</div>

					<div style={rightRow}>
						<div>
							<RemotionInput
								style={input}
								value={customTargetVideoBitrate}
								onChange={onTargetVideoBitrateChanged}
								status="ok"
								rightAlign
							/>
						</div>
					</div>
				</div>
			) : null}
			{renderMode === 'video' ? <RenderModalHr /> : null}
			<ScaleSetting scale={scale} setScale={setScale} />
			{renderMode === 'video' ? <RenderModalHr /> : null}
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
		</div>
	);
};
