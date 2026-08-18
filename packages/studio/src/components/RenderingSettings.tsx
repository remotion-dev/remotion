import type {
	AudioCodec,
	Codec,
	StillImageFormat,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ConfigUpdate} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {labelx264Preset} from '../helpers/presets-labels';
import {labelProResProfile} from '../helpers/prores-labels';
import {Checkmark} from '../icons/Checkmark';
import {sectionHeader} from './InspectorPanel/styles';
import {Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {Combobox} from './NewComposition/ComboBox';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {CrfSetting} from './RenderModal/CrfSetting';
import {humanReadableCodec} from './RenderModal/human-readable-codec';
import {input, label, optionRow, rightRow} from './RenderModal/layout';
import {NumberSetting} from './RenderModal/NumberSetting';
import {RenderModalHr} from './RenderModal/RenderModalHr';
import type {SegmentedControlItem} from './SegmentedControl';
import {SegmentedControl} from './SegmentedControl';
import {useSettings} from './SettingsContext';
import {useAutoSaveConfig} from './use-auto-save-config';

const container: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
};

const dividerLabel: React.CSSProperties = {
	...sectionHeader,
	margin: 0,
	padding: '4px 16px',
};

const fullWidth: React.CSSProperties = {
	boxSizing: 'border-box',
	width: 180,
};

const DEFAULT_AUDIO_CODEC = 'automatic';
type ProResProfile = (typeof BrowserSafeApis.proResProfileOptions)[number];
type QualityMode = 'crf' | 'bitrate';

export const RenderingSettings: React.FC = () => {
	const {error: settingsError, renderDefaults, revision} = useSettings();
	const [codec, setCodec] = useState<Codec>('h264');
	const [outputLocation, setOutputLocation] = useState('');
	const [scale, setScale] = useState(1);
	const [stillImageFormat, setStillImageFormat] =
		useState<StillImageFormat>('png');
	const [videoImageFormat, setVideoImageFormat] =
		useState<VideoImageFormat>('jpeg');
	const [proResProfile, setProResProfile] = useState<ProResProfile>('hq');
	const [x264Preset, setX264Preset] = useState<X264Preset>('medium');
	const [qualityMode, setQualityMode] = useState<QualityMode>('crf');
	const [crf, setCrf] = useState(18);
	const [videoBitrate, setVideoBitrate] = useState('1M');
	const [audioCodec, setAudioCodec] = useState<AudioCodec | null>(null);
	const [audioBitrate, setAudioBitrate] = useState('');
	const [concurrency, setConcurrency] = useState(1);
	const [editedSetters, setEditedSetters] = useState<Set<string>>(
		() => new Set(),
	);
	const [syncedRevision, setSyncedRevision] = useState(-1);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (renderDefaults === null) {
			return;
		}

		setCodec(renderDefaults.codec);
		setOutputLocation(renderDefaults.outputLocation ?? '');
		setScale(renderDefaults.scale);
		setStillImageFormat(renderDefaults.stillImageFormat);
		setVideoImageFormat(renderDefaults.videoImageFormat);
		setProResProfile(renderDefaults.proResProfile ?? 'hq');
		setX264Preset(renderDefaults.x264Preset);
		setQualityMode(renderDefaults.videoBitrate === null ? 'crf' : 'bitrate');
		setCrf(
			renderDefaults.crf ??
				BrowserSafeApis.getDefaultCrfForCodec(renderDefaults.codec) ??
				18,
		);
		setVideoBitrate(renderDefaults.videoBitrate ?? '1M');
		setAudioCodec(renderDefaults.audioCodec);
		setAudioBitrate(renderDefaults.audioBitrate ?? '');
		setConcurrency(renderDefaults.concurrency);
		setEditedSetters(new Set());
		setSyncedRevision(revision);
		setError(null);
	}, [renderDefaults, revision]);
	const markEdited = useCallback((setter: string) => {
		setEditedSetters((current) => new Set(current).add(setter));
	}, []);
	const selectCodec = useCallback(
		(value: Codec) => {
			setCodec(value);
			markEdited('setCodec');
		},
		[markEdited],
	);
	const selectStillImageFormat = useCallback(
		(value: StillImageFormat) => {
			setStillImageFormat(value);
			markEdited('setStillImageFormat');
		},
		[markEdited],
	);
	const selectVideoImageFormat = useCallback(
		(value: VideoImageFormat) => {
			setVideoImageFormat(value);
			markEdited('setVideoImageFormat');
		},
		[markEdited],
	);
	const selectProResProfile = useCallback(
		(value: ProResProfile) => {
			setProResProfile(value);
			markEdited('setProResProfile');
		},
		[markEdited],
	);
	const selectX264Preset = useCallback(
		(value: X264Preset) => {
			setX264Preset(value);
			markEdited('setX264Preset');
		},
		[markEdited],
	);
	const selectQualityMode = useCallback(
		(value: QualityMode) => {
			setQualityMode(value);
			markEdited('setCrf');
			markEdited('setVideoBitrate');
		},
		[markEdited],
	);
	const changeCrf = useCallback<React.Dispatch<React.SetStateAction<number>>>(
		(value) => {
			setCrf(value);
			markEdited('setCrf');
			markEdited('setVideoBitrate');
		},
		[markEdited],
	);
	const selectAudioCodec = useCallback(
		(value: AudioCodec | null) => {
			setAudioCodec(value);
			markEdited('setAudioCodec');
		},
		[markEdited],
	);
	const changeScale = useCallback<React.Dispatch<React.SetStateAction<number>>>(
		(value) => {
			setScale(value);
			markEdited('setScale');
		},
		[markEdited],
	);
	const changeConcurrency = useCallback<
		React.Dispatch<React.SetStateAction<number>>
	>(
		(value) => {
			setConcurrency(value);
			markEdited('setConcurrency');
		},
		[markEdited],
	);

	const makeValues = <T extends string>({
		options,
		selected,
		setSelected,
		labelValue = (value) => value,
	}: {
		options: readonly T[];
		selected: T;
		setSelected: (value: T) => void;
		labelValue?: (value: T) => string;
	}): ComboboxValue[] =>
		options.map((value) => ({
			id: value,
			key: value,
			keyHint: null,
			label: labelValue(value),
			leftItem: selected === value ? <Checkmark /> : null,
			onClick: () => setSelected(value),
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item',
			value,
		}));

	const codecValues = useMemo(
		() =>
			makeValues({
				options: BrowserSafeApis.validCodecs.filter(
					(value) => value !== 'mp3' && value !== 'wav' && value !== 'aac',
				),
				selected: codec,
				setSelected: selectCodec,
				labelValue: humanReadableCodec,
			}),
		[codec, selectCodec],
	);
	const stillFormatValues = useMemo(
		() =>
			makeValues({
				options: BrowserSafeApis.validStillImageFormats,
				selected: stillImageFormat,
				setSelected: selectStillImageFormat,
				labelValue: (value) => value.toUpperCase(),
			}),
		[selectStillImageFormat, stillImageFormat],
	);
	const videoFormatValues = useMemo(
		() =>
			makeValues({
				options: BrowserSafeApis.validVideoImageFormats,
				selected: videoImageFormat,
				setSelected: selectVideoImageFormat,
				labelValue: (value) => value.toUpperCase(),
			}),
		[selectVideoImageFormat, videoImageFormat],
	);
	const profileValues = useMemo(
		() =>
			makeValues({
				options: BrowserSafeApis.proResProfileOptions,
				selected: proResProfile,
				setSelected: selectProResProfile,
				labelValue: labelProResProfile,
			}),
		[proResProfile, selectProResProfile],
	);
	const presetValues = useMemo(
		() =>
			makeValues({
				options: BrowserSafeApis.x264PresetOptions,
				selected: x264Preset,
				setSelected: selectX264Preset,
				labelValue: labelx264Preset,
			}),
		[selectX264Preset, x264Preset],
	);
	const audioCodecValues = useMemo((): ComboboxValue[] => {
		return [
			{
				id: DEFAULT_AUDIO_CODEC,
				keyHint: null,
				label: 'Automatic',
				leftItem: audioCodec === null ? <Checkmark /> : null,
				onClick: () => selectAudioCodec(null),
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: DEFAULT_AUDIO_CODEC,
			},
			...makeValues({
				options: BrowserSafeApis.validAudioCodecs,
				selected: audioCodec ?? 'aac',
				setSelected: selectAudioCodec,
				labelValue: (value) => value.toUpperCase(),
			}),
		];
	}, [audioCodec, selectAudioCodec]);
	const qualityModeValues = useMemo((): SegmentedControlItem[] => {
		return (['crf', 'bitrate'] as const).map((value) => ({
			key: value,
			label: value === 'crf' ? 'CRF' : 'Bitrate',
			onClick: () => selectQualityMode(value),
			selected: qualityMode === value,
		}));
	}, [qualityMode, selectQualityMode]);

	const updates = useMemo((): ConfigUpdate[] => {
		const allUpdates: ConfigUpdate[] = [
			{setter: 'setCodec', type: 'set', value: codec},
			outputLocation.trim() === ''
				? {setter: 'setOutputLocation', type: 'delete'}
				: {
						setter: 'setOutputLocation',
						type: 'set',
						value: outputLocation.trim(),
					},
			{setter: 'setScale', type: 'set', value: scale},
			{setter: 'setStillImageFormat', type: 'set', value: stillImageFormat},
			{setter: 'setVideoImageFormat', type: 'set', value: videoImageFormat},
			qualityMode === 'crf'
				? {setter: 'setCrf', type: 'set', value: crf}
				: {setter: 'setCrf', type: 'delete'},
			qualityMode === 'bitrate'
				? {setter: 'setVideoBitrate', type: 'set', value: videoBitrate.trim()}
				: {setter: 'setVideoBitrate', type: 'delete'},
			...(codec === 'prores'
				? ([
						{setter: 'setProResProfile', type: 'set', value: proResProfile},
					] satisfies ConfigUpdate[])
				: []),
			...(codec === 'h264'
				? ([
						{setter: 'setX264Preset', type: 'set', value: x264Preset},
					] satisfies ConfigUpdate[])
				: []),
			audioCodec === null
				? {setter: 'setAudioCodec', type: 'delete'}
				: {setter: 'setAudioCodec', type: 'set', value: audioCodec},
			audioBitrate.trim() === ''
				? {setter: 'setAudioBitrate', type: 'delete'}
				: {
						setter: 'setAudioBitrate',
						type: 'set',
						value: audioBitrate.trim(),
					},
			{setter: 'setConcurrency', type: 'set', value: concurrency},
		];

		return allUpdates.filter((update) => editedSetters.has(update.setter));
	}, [
		audioBitrate,
		audioCodec,
		codec,
		concurrency,
		crf,
		editedSetters,
		outputLocation,
		proResProfile,
		qualityMode,
		scale,
		stillImageFormat,
		videoImageFormat,
		videoBitrate,
		x264Preset,
	]);

	const ready = renderDefaults !== null && syncedRevision === revision;
	useAutoSaveConfig({
		enabled: ready,
		onError: setError,
		ready,
		syncRevision: syncedRevision,
		updates,
	});

	const onOutputLocationChange: React.ChangeEventHandler<HTMLInputElement> = (
		event,
	) => {
		setOutputLocation(event.target.value);
	};

	const onOutputLocationBlur = () => markEdited('setOutputLocation');

	const onAudioBitrateChange: React.ChangeEventHandler<HTMLInputElement> = (
		event,
	) => {
		setAudioBitrate(event.target.value);
	};

	const onAudioBitrateBlur = () => markEdited('setAudioBitrate');

	const onVideoBitrateChange: React.ChangeEventHandler<HTMLInputElement> = (
		event,
	) => {
		setVideoBitrate(event.target.value);
	};

	const onVideoBitrateBlur = () => {
		markEdited('setCrf');
		markEdited('setVideoBitrate');
	};

	if (renderDefaults === null) {
		return null;
	}

	return (
		<div style={container}>
			<p style={dividerLabel}>Output</p>
			<div style={optionRow}>
				<div style={label}>Default codec</div>
				<div style={rightRow}>
					<Combobox values={codecValues} selectedId={codec} title="Codec" />
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Output location</div>
				<div style={rightRow}>
					<RemotionInput
						placeholder="out/{composition}.{codec}"
						style={{...input, ...fullWidth}}
						value={outputLocation}
						onChange={onOutputLocationChange}
						onBlur={onOutputLocationBlur}
						status="ok"
						rightAlign
					/>
				</div>
			</div>
			<NumberSetting
				name="Scale"
				value={scale}
				onValueChanged={changeScale}
				min={0.1}
				step={0.1}
			/>
			<div style={optionRow}>
				<div style={label}>Still image format</div>
				<div style={rightRow}>
					<Combobox
						values={stillFormatValues}
						selectedId={stillImageFormat}
						title="Still image format"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Video frame format</div>
				<div style={rightRow}>
					<Combobox
						values={videoFormatValues}
						selectedId={videoImageFormat}
						title="Video frame format"
					/>
				</div>
			</div>

			<RenderModalHr />
			<p style={dividerLabel}>Encoding</p>
			{BrowserSafeApis.codecSupportsCrf(codec) &&
			BrowserSafeApis.codecSupportsVideoBitrate(codec) ? (
				<div style={optionRow}>
					<div style={label}>Quality control</div>
					<div style={rightRow}>
						<SegmentedControl items={qualityModeValues} needsWrapping />
					</div>
				</div>
			) : null}
			{qualityMode === 'crf' &&
			BrowserSafeApis.codecSupportsCrf(codec) &&
			BrowserSafeApis.getValidCrfRanges(codec) ? (
				<CrfSetting
					crf={crf}
					setCrf={changeCrf}
					min={BrowserSafeApis.getValidCrfRanges(codec)[0]}
					max={BrowserSafeApis.getValidCrfRanges(codec)[1]}
					option="crfOption"
				/>
			) : null}
			{qualityMode === 'bitrate' &&
			BrowserSafeApis.codecSupportsVideoBitrate(codec) ? (
				<div style={optionRow}>
					<div style={label}>Video bitrate</div>
					<div style={rightRow}>
						<RemotionInput
							style={{...input, ...fullWidth}}
							value={videoBitrate}
							onChange={onVideoBitrateChange}
							onBlur={onVideoBitrateBlur}
							status="ok"
							rightAlign
						/>
					</div>
				</div>
			) : null}
			{codec === 'prores' ? (
				<div style={optionRow}>
					<div style={label}>ProRes profile</div>
					<div style={rightRow}>
						<Combobox
							values={profileValues}
							selectedId={proResProfile}
							title="ProRes profile"
						/>
					</div>
				</div>
			) : null}
			{codec === 'h264' ? (
				<div style={optionRow}>
					<div style={label}>x264 preset</div>
					<div style={rightRow}>
						<Combobox
							values={presetValues}
							selectedId={x264Preset}
							title="x264 preset"
						/>
					</div>
				</div>
			) : null}

			<RenderModalHr />
			<p style={dividerLabel}>Audio</p>
			<div style={optionRow}>
				<div style={label}>Audio codec</div>
				<div style={rightRow}>
					<Combobox
						values={audioCodecValues}
						selectedId={audioCodec ?? DEFAULT_AUDIO_CODEC}
						title="Audio codec"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Audio bitrate</div>
				<div style={rightRow}>
					<RemotionInput
						placeholder="Automatic"
						style={{...input, ...fullWidth}}
						value={audioBitrate}
						onChange={onAudioBitrateChange}
						onBlur={onAudioBitrateBlur}
						status="ok"
						rightAlign
					/>
				</div>
			</div>

			<RenderModalHr />
			<p style={dividerLabel}>Performance</p>
			<NumberSetting
				name="Concurrency"
				value={concurrency}
				onValueChanged={changeConcurrency}
				min={renderDefaults.minConcurrency}
				max={renderDefaults.maxConcurrency}
				step={1}
			/>
			{(error ?? settingsError) ? (
				<>
					<Spacing y={1} block />
					<div style={{paddingLeft: 16, paddingRight: 16}}>
						<ValidationMessage
							message={error ?? settingsError ?? ''}
							align="flex-start"
							type="error"
						/>
					</div>
				</>
			) : null}
			<Spacing y={2} block />
		</div>
	);
};
