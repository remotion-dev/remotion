import type {
	ColorSpace,
	Codec,
	PixelFormat,
	X264Preset,
} from '@remotion/renderer';
import type {HardwareAccelerationOption} from '@remotion/renderer/client';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ChangeEvent} from 'react';
import React, {useCallback, useMemo} from 'react';
import {labelx264Preset} from '../../helpers/presets-labels';
import {Checkmark} from '../../icons/Checkmark';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue, SelectionItem} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {RemotionInput} from '../NewComposition/RemInput';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {CrfSetting} from './CrfSetting';
import {input, label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalHr} from './RenderModalHr';

const qualityControlModes = ['crf', 'bitrate'] as const;
export type QualityControl = (typeof qualityControlModes)[number];

const container: React.CSSProperties = {
	flex: 1,
	overflowY: 'auto',
};

export const RenderModalEncoding: React.FC<{
	readonly renderMode: RenderType;
	readonly codec: Codec;
	readonly qualityControlType: QualityControl | null;
	readonly setQualityControl: React.Dispatch<
		React.SetStateAction<QualityControl>
	>;
	readonly shouldDisplayQualityControlPicker: boolean;
	readonly crf: number | null;
	readonly minCrf: number;
	readonly maxCrf: number;
	readonly setCrf: React.Dispatch<React.SetStateAction<number>>;
	readonly customTargetVideoBitrate: string;
	readonly setCustomTargetVideoBitrateValue: React.Dispatch<
		React.SetStateAction<string>
	>;
	readonly encodingBufferSize: string | null;
	readonly setEncodingBufferSize: React.Dispatch<
		React.SetStateAction<string | null>
	>;
	readonly encodingMaxRate: string | null;
	readonly setEncodingMaxRate: React.Dispatch<
		React.SetStateAction<string | null>
	>;
	readonly pixelFormat: PixelFormat;
	readonly pixelFormatOptions: ComboboxValue[];
	readonly colorSpace: ColorSpace;
	readonly setColorSpace: React.Dispatch<React.SetStateAction<ColorSpace>>;
	readonly x264Preset: X264Preset | null;
	readonly setx264Preset: React.Dispatch<React.SetStateAction<X264Preset>>;
	readonly gopSize: number | null;
	readonly setGopSize: React.Dispatch<React.SetStateAction<number | null>>;
	readonly hardwareAcceleration: HardwareAccelerationOption;
	readonly setHardwareAcceleration: React.Dispatch<
		React.SetStateAction<HardwareAccelerationOption>
	>;
	readonly disallowParallelEncoding: boolean;
	readonly setDisallowParallelEncoding: React.Dispatch<
		React.SetStateAction<boolean>
	>;
}> = ({
	renderMode,
	codec,
	qualityControlType,
	setQualityControl,
	shouldDisplayQualityControlPicker,
	crf,
	minCrf,
	maxCrf,
	setCrf,
	customTargetVideoBitrate,
	setCustomTargetVideoBitrateValue,
	encodingBufferSize,
	setEncodingBufferSize,
	encodingMaxRate,
	setEncodingMaxRate,
	pixelFormat,
	pixelFormatOptions,
	colorSpace,
	setColorSpace,
	x264Preset,
	setx264Preset,
	gopSize,
	setGopSize,
	hardwareAcceleration,
	setHardwareAcceleration,
	disallowParallelEncoding,
	setDisallowParallelEncoding,
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

	const x264PresetOptions = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.x264PresetOptions.map((option) => {
			return {
				label: labelx264Preset(option),
				onClick: () => setx264Preset(option),
				key: option,
				type: 'item',
				id: option,
				keyHint: null,
				leftItem: x264Preset === option ? <Checkmark /> : null,
				quickSwitcherLabel: null,
				subMenu: null,
				value: option,
			};
		});
	}, [setx264Preset, x264Preset]);

	const hardwareAccelerationValues = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.hardwareAccelerationOptions.map(
			(option): SelectionItem => {
				return {
					label: option,
					onClick: () => setHardwareAcceleration(option),
					leftItem: hardwareAcceleration === option ? <Checkmark /> : null,
					subMenu: null,
					quickSwitcherLabel: null,
					type: 'item',
					id: option,
					keyHint: null,
					value: option,
				};
			},
		);
	}, [hardwareAcceleration, setHardwareAcceleration]);

	const toggleCustomGopSize = useCallback(() => {
		setGopSize((previous) => {
			if (previous === null) {
				return 120;
			}

			return null;
		});
	}, [setGopSize]);

	const changeGopSize: React.Dispatch<React.SetStateAction<number>> =
		useCallback(
			(cb) => {
				setGopSize((prev) => {
					if (prev === null) {
						throw new TypeError('Expected previous value');
					}

					if (typeof cb === 'function') {
						return cb(prev);
					}

					return cb;
				});
			},
			[setGopSize],
		);

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

	const onDisallowParallelEncodingChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setDisallowParallelEncoding(e.target.checked);
		},
		[setDisallowParallelEncoding],
	);

	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			{shouldDisplayQualityControlPicker && renderMode === 'video' ? (
				<div style={optionRow}>
					<div style={label}>Quality control</div>

					<div style={rightRow}>
						<SegmentedControl items={qualityControlOptions} needsWrapping />
					</div>
				</div>
			) : null}
			{qualityControlType === 'crf' &&
			renderMode === 'video' &&
			crf !== null ? (
				<CrfSetting
					crf={crf}
					min={minCrf}
					max={maxCrf}
					setCrf={setCrf}
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
					<RenderModalHr />
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
					<RenderModalHr />
					{codec === 'h264' ? (
						<div style={optionRow}>
							<div style={label}>
								x264 Preset
								<Spacing x={0.5} />
								<OptionExplainerBubble id="x264Option" />
							</div>
							<div style={rightRow}>
								<Combobox
									title={x264Preset as string}
									selectedId={x264Preset as string}
									values={x264PresetOptions}
								/>
							</div>
						</div>
					) : null}
					{codec !== 'gif' ? (
						<div style={optionRow}>
							<div style={label}>
								Custom GOP size
								<Spacing x={0.5} />
								<OptionExplainerBubble id="gopSizeOption" />
							</div>
							<div style={rightRow}>
								<Checkbox
									checked={gopSize !== null}
									onChange={toggleCustomGopSize}
									name="custom-gop-size"
								/>
							</div>
						</div>
					) : null}
					{codec !== 'gif' && gopSize !== null ? (
						<NumberSetting
							min={1}
							max={10000}
							step={1}
							name="GOP size"
							formatter={(value) => `${value} frames`}
							onValueChanged={changeGopSize}
							value={gopSize}
						/>
					) : null}
					<div style={optionRow}>
						<div style={label}>
							Hardware acceleration
							<Spacing x={0.5} />
							<OptionExplainerBubble id="hardwareAccelerationOption" />
						</div>
						<div style={rightRow}>
							<Combobox
								title={hardwareAcceleration as string}
								selectedId={hardwareAcceleration as string}
								values={hardwareAccelerationValues}
							/>
						</div>
					</div>
				</>
			) : null}
			{renderMode === 'still' ? null : (
				<>
					{renderMode === 'video' ? <RenderModalHr /> : null}
					<div style={optionRow}>
						<div style={label}>No parallel encoding</div>
						<div style={rightRow}>
							<Checkbox
								checked={disallowParallelEncoding}
								onChange={onDisallowParallelEncodingChanged}
								name="disallow-parallel-encoding"
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
