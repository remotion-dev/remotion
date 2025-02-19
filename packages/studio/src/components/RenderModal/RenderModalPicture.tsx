import type {
	ColorSpace,
	PixelFormat,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ChangeEvent} from 'react';
import React, {useCallback, useMemo} from 'react';
import {Checkmark} from '../../icons/Checkmark';
import {Checkbox} from '../Checkbox';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {RemotionInput} from '../NewComposition/RemInput';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {Spacing} from '../layout';
import {CrfSetting} from './CrfSetting';
import {JpegQualitySetting} from './JpegQualitySetting';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalHr} from './RenderModalHr';
import {ScaleSetting} from './ScaleSetting';
import {input, label, optionRow, rightRow} from './layout';

const qualityControlModes = ['crf', 'bitrate'] as const;
export type QualityControl = (typeof qualityControlModes)[number];

const container: React.CSSProperties = {
	flex: 1,
	overflowY: 'auto',
};

export const RenderModalPicture: React.FC<{
	readonly renderMode: RenderType;
	readonly scale: number;
	readonly setScale: React.Dispatch<React.SetStateAction<number>>;
	readonly pixelFormat: PixelFormat;
	readonly colorSpace: ColorSpace;
	readonly setColorSpace: React.Dispatch<React.SetStateAction<ColorSpace>>;
	readonly imageFormatOptions: SegmentedControlItem[];
	readonly setQualityControl: React.Dispatch<
		React.SetStateAction<QualityControl>
	>;
	readonly qualityControlType: QualityControl | null;
	readonly videoImageFormat: VideoImageFormat;
	readonly stillImageFormat: StillImageFormat;
	readonly setJpegQuality: React.Dispatch<React.SetStateAction<number>>;
	readonly jpegQuality: number;
	readonly maxCrf: number;
	readonly minCrf: number;
	readonly setCrf: React.Dispatch<React.SetStateAction<number>>;
	readonly setCustomTargetVideoBitrateValue: React.Dispatch<
		React.SetStateAction<string>
	>;
	readonly crf: number | null;
	readonly customTargetVideoBitrate: string;
	readonly shouldDisplayQualityControlPicker: boolean;
	readonly pixelFormatOptions: ComboboxValue[];
	readonly encodingBufferSize: string | null;
	readonly setEncodingBufferSize: React.Dispatch<
		React.SetStateAction<string | null>
	>;
	readonly encodingMaxRate: string | null;
	readonly setEncodingMaxRate: React.Dispatch<
		React.SetStateAction<string | null>
	>;
}> = ({
	renderMode,
	scale,
	setScale,
	pixelFormat,
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
	colorSpace,
	setColorSpace,
	pixelFormatOptions,
	encodingBufferSize,
	encodingMaxRate,
	setEncodingBufferSize,
	setEncodingMaxRate,
}) => {
	const colorSpaceOptions = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.validColorSpaces.map((option) => {
			return {
				label: option,
				onClick: () => setColorSpace(option),
				key: option,
				id: option,
				keyHint: null,
				leftItem: colorSpace === option ? <Checkmark /> : null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: option,
			};
		});
	}, [colorSpace, setColorSpace]);

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

	const onEncodingBufferSizeToggled = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setEncodingBufferSize(e.target.checked ? '10000k' : null);
		},
		[setEncodingBufferSize],
	);

	const onEncodingMaxRateToggled = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setEncodingMaxRate(e.target.checked ? '5000k' : null);
		},
		[setEncodingMaxRate],
	);

	const onEncodingBufferSizeChanged: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setEncodingBufferSize(e.target.value);
			},
			[setEncodingBufferSize],
		);

	const onEncodingMaxRateChanged: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setEncodingMaxRate(e.target.value);
			},
			[setEncodingMaxRate],
		);

	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
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
			{qualityControlType === 'crf' &&
			renderMode !== 'still' &&
			renderMode !== 'sequence' &&
			crf !== null ? (
				<CrfSetting
					crf={crf}
					min={minCrf}
					max={maxCrf}
					setCrf={setCrf as React.Dispatch<React.SetStateAction<number>>}
					option="crfOption"
				/>
			) : null}
			{qualityControlType === 'bitrate' && renderMode === 'video' ? (
				<div style={optionRow}>
					<div style={label}>
						Target video bitrate
						<Spacing x={0.5} />
						<OptionExplainerBubble id="videoBitrateOption" />
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
			{renderMode === 'video' ? (
				<>
					<div style={optionRow}>
						<div style={label}>
							Custom FFmpeg -bufsize
							<Spacing x={0.5} />
							<OptionExplainerBubble id="encodingBufferSizeOption" />
						</div>
						<div style={rightRow}>
							<Checkbox
								checked={encodingBufferSize !== null}
								onChange={onEncodingBufferSizeToggled}
								name="encoding-buffer-size"
							/>
						</div>
					</div>
					{encodingBufferSize === null ? null : (
						<div style={optionRow}>
							<div style={label}>-bufsize value</div>
							<div style={rightRow}>
								<div>
									<RemotionInput
										style={input}
										value={encodingBufferSize}
										onChange={onEncodingBufferSizeChanged}
										status="ok"
										rightAlign
									/>
								</div>
							</div>
						</div>
					)}
					<div style={optionRow}>
						<div style={label}>
							Custom FFmpeg -maxrate
							<Spacing x={0.5} />
							<OptionExplainerBubble id="encodingMaxRateOption" />
						</div>
						<div style={rightRow}>
							<Checkbox
								checked={encodingMaxRate !== null}
								onChange={onEncodingMaxRateToggled}
								name="encoding-max-rate"
							/>
						</div>
					</div>
					{encodingMaxRate === null ? null : (
						<div style={optionRow}>
							<div style={label}>-maxrate value</div>
							<div style={rightRow}>
								<div>
									<RemotionInput
										style={input}
										value={encodingMaxRate}
										onChange={onEncodingMaxRateChanged}
										status="ok"
										rightAlign
									/>
								</div>
							</div>
						</div>
					)}
				</>
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
			{renderMode === 'video' ? (
				<div style={optionRow}>
					<div style={label}>
						Color space
						<Spacing x={0.5} />
						<OptionExplainerBubble id="colorSpaceOption" />
					</div>
					<div style={rightRow}>
						<Combobox
							values={colorSpaceOptions}
							selectedId={colorSpace}
							title="Color Space"
						/>
					</div>
				</div>
			) : null}
		</div>
	);
};
