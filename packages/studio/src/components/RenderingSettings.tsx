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
import {Checkbox} from './Checkbox';
import {sectionHeader} from './InspectorPanel/styles';
import {Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {Combobox} from './NewComposition/ComboBox';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {humanReadableCodec} from './RenderModal/human-readable-codec';
import {input, rightRow} from './RenderModal/layout';
import type {SegmentedControlItem} from './SegmentedControl';
import {SegmentedControl} from './SegmentedControl';
import {settingsCatalog} from './settings-catalog';
import type {RenderingSettingsDisplayState} from './settings-search';
import {useSettings} from './SettingsContext';
import {SettingsNumber} from './SettingsNumber';
import {SettingsRow} from './SettingsRow';
import {useAutoSaveConfig} from './use-auto-save-config';

const container: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
};

const dividerLabel: React.CSSProperties = {
	...sectionHeader,
	lineHeight: '16px',
	margin: 0,
	padding: '4px 16px 0',
};

const sectionTitle: React.CSSProperties = {
	...dividerLabel,
	marginTop: 8,
};

const fullWidth: React.CSSProperties = {
	boxSizing: 'border-box',
	width: 180,
};

const REMOTION_DEFAULT = 'remotion-default';
const DEFAULT_CODEC: Codec = 'h264';
const DEFAULT_STILL_IMAGE_FORMAT: StillImageFormat = 'png';
const DEFAULT_VIDEO_IMAGE_FORMAT: VideoImageFormat = 'jpeg';
const DEFAULT_PRO_RES_PROFILE: ProResProfile = 'hq';
const DEFAULT_X264_PRESET: X264Preset = 'medium';
type ProResProfile = (typeof BrowserSafeApis.proResProfileOptions)[number];
type QualityMode = RenderingSettingsDisplayState['qualityMode'];

export const RenderingSettings: React.FC<{
	readonly displayState: RenderingSettingsDisplayState;
	readonly setDisplayState: React.Dispatch<
		React.SetStateAction<RenderingSettingsDisplayState>
	>;
}> = ({displayState, setDisplayState}) => {
	const {error: settingsError, renderDefaults, revision} = useSettings();
	const {codec, qualityMode} = displayState;
	const [scale, setScale] = useState(1);
	const [stillImageFormat, setStillImageFormat] =
		useState<StillImageFormat | null>(null);
	const [videoImageFormat, setVideoImageFormat] =
		useState<VideoImageFormat | null>(null);
	const [proResProfile, setProResProfile] = useState<ProResProfile | null>(
		null,
	);
	const [x264Preset, setX264Preset] = useState<X264Preset | null>(null);
	const [crf, setCrf] = useState(18);
	const [videoBitrate, setVideoBitrate] = useState('1M');
	const [audioCodec, setAudioCodec] = useState<AudioCodec | null>(null);
	const [concurrency, setConcurrency] = useState(1);
	const [beepOnFinish, setBeepOnFinish] = useState(false);
	const [editedSetters, setEditedSetters] = useState<Set<string>>(
		() => new Set(),
	);
	const [syncedRevision, setSyncedRevision] = useState(-1);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (renderDefaults === null) {
			return;
		}

		setScale(renderDefaults.scale);
		setStillImageFormat(
			renderDefaults.configFileRenderDefaults?.stillImageFormat ?? null,
		);
		setVideoImageFormat(
			renderDefaults.configFileRenderDefaults?.videoImageFormat ?? null,
		);
		setProResProfile(
			renderDefaults.configFileRenderDefaults?.proResProfile ?? null,
		);
		setX264Preset(renderDefaults.configFileRenderDefaults?.x264Preset ?? null);
		setCrf(
			renderDefaults.crf ??
				BrowserSafeApis.getDefaultCrfForCodec(renderDefaults.codec) ??
				18,
		);
		setVideoBitrate(renderDefaults.videoBitrate ?? '1M');
		setAudioCodec(renderDefaults.audioCodec);
		setConcurrency(renderDefaults.concurrency);
		setBeepOnFinish(renderDefaults.beepOnFinish);
		setEditedSetters(new Set());
		setSyncedRevision(revision);
		setError(null);
	}, [renderDefaults, revision]);
	const markEdited = useCallback((setter: string) => {
		setEditedSetters((current) => new Set(current).add(setter));
	}, []);
	const selectCodec = useCallback(
		(value: Codec | null) => {
			setDisplayState((current) => ({...current, codec: value}));
			markEdited('setCodec');
		},
		[markEdited, setDisplayState],
	);
	const selectStillImageFormat = useCallback(
		(value: StillImageFormat | null) => {
			setStillImageFormat(value);
			markEdited('setStillImageFormat');
		},
		[markEdited],
	);
	const selectVideoImageFormat = useCallback(
		(value: VideoImageFormat | null) => {
			setVideoImageFormat(value);
			markEdited('setVideoImageFormat');
		},
		[markEdited],
	);
	const selectProResProfile = useCallback(
		(value: ProResProfile | null) => {
			setProResProfile(value);
			markEdited('setProResProfile');
		},
		[markEdited],
	);
	const selectX264Preset = useCallback(
		(value: X264Preset | null) => {
			setX264Preset(value);
			markEdited('setX264Preset');
		},
		[markEdited],
	);
	const selectQualityMode = useCallback(
		(value: QualityMode) => {
			setDisplayState((current) => ({...current, qualityMode: value}));
			markEdited('setCrf');
			markEdited('setVideoBitrate');
		},
		[markEdited, setDisplayState],
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
		selected: T | null;
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
	const makeRemotionDefaultValue = ({
		labelValue,
		onClick,
		selected,
	}: {
		labelValue: string;
		onClick: () => void;
		selected: boolean;
	}): ComboboxValue[] => [
		{
			id: REMOTION_DEFAULT,
			keyHint: null,
			label: `Default (${labelValue})`,
			leftItem: selected ? <Checkmark /> : null,
			onClick,
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item',
			value: REMOTION_DEFAULT,
		},
		{id: `${REMOTION_DEFAULT}-divider`, type: 'divider'},
	];

	const codecValues = useMemo(
		() => [
			...makeRemotionDefaultValue({
				labelValue: humanReadableCodec(DEFAULT_CODEC),
				onClick: () => selectCodec(null),
				selected: codec === null,
			}),
			...makeValues({
				options: BrowserSafeApis.validCodecs.filter(
					(value) => value !== 'mp3' && value !== 'wav' && value !== 'aac',
				),
				selected: codec,
				setSelected: selectCodec,
				labelValue: humanReadableCodec,
			}),
		],
		[codec, selectCodec],
	);
	const stillFormatValues = useMemo(
		() => [
			...makeRemotionDefaultValue({
				labelValue: DEFAULT_STILL_IMAGE_FORMAT.toUpperCase(),
				onClick: () => selectStillImageFormat(null),
				selected: stillImageFormat === null,
			}),
			...makeValues({
				options: BrowserSafeApis.validStillImageFormats,
				selected: stillImageFormat,
				setSelected: selectStillImageFormat,
				labelValue: (value) => value.toUpperCase(),
			}),
		],
		[selectStillImageFormat, stillImageFormat],
	);
	const videoFormatValues = useMemo(
		() => [
			...makeRemotionDefaultValue({
				labelValue: DEFAULT_VIDEO_IMAGE_FORMAT.toUpperCase(),
				onClick: () => selectVideoImageFormat(null),
				selected: videoImageFormat === null,
			}),
			...makeValues({
				options: BrowserSafeApis.validVideoImageFormats,
				selected: videoImageFormat,
				setSelected: selectVideoImageFormat,
				labelValue: (value) => value.toUpperCase(),
			}),
		],
		[selectVideoImageFormat, videoImageFormat],
	);
	const profileValues = useMemo(
		() => [
			...makeRemotionDefaultValue({
				labelValue: labelProResProfile(DEFAULT_PRO_RES_PROFILE),
				onClick: () => selectProResProfile(null),
				selected: proResProfile === null,
			}),
			...makeValues({
				options: BrowserSafeApis.proResProfileOptions,
				selected: proResProfile,
				setSelected: selectProResProfile,
				labelValue: labelProResProfile,
			}),
		],
		[proResProfile, selectProResProfile],
	);
	const presetValues = useMemo(
		() => [
			...makeRemotionDefaultValue({
				labelValue: labelx264Preset(DEFAULT_X264_PRESET),
				onClick: () => selectX264Preset(null),
				selected: x264Preset === null,
			}),
			...makeValues({
				options: BrowserSafeApis.x264PresetOptions,
				selected: x264Preset,
				setSelected: selectX264Preset,
				labelValue: labelx264Preset,
			}),
		],
		[selectX264Preset, x264Preset],
	);
	const audioCodecValues = useMemo((): ComboboxValue[] => {
		return [
			...makeRemotionDefaultValue({
				labelValue: 'Automatic',
				onClick: () => selectAudioCodec(null),
				selected: audioCodec === null,
			}),
			...makeValues({
				options: BrowserSafeApis.validAudioCodecs,
				selected: audioCodec,
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
	const resolvedCodec = codec ?? DEFAULT_CODEC;

	const updates = useMemo((): ConfigUpdate[] => {
		const allUpdates: ConfigUpdate[] = [
			codec === null
				? {setter: 'setCodec', type: 'delete'}
				: {setter: 'setCodec', type: 'set', value: codec},
			{setter: 'setScale', type: 'set', value: scale},
			stillImageFormat === null
				? {setter: 'setStillImageFormat', type: 'delete'}
				: {
						setter: 'setStillImageFormat',
						type: 'set',
						value: stillImageFormat,
					},
			videoImageFormat === null
				? {setter: 'setVideoImageFormat', type: 'delete'}
				: {
						setter: 'setVideoImageFormat',
						type: 'set',
						value: videoImageFormat,
					},
			qualityMode === 'crf'
				? {setter: 'setCrf', type: 'set', value: crf}
				: {setter: 'setCrf', type: 'delete'},
			qualityMode === 'bitrate'
				? {setter: 'setVideoBitrate', type: 'set', value: videoBitrate.trim()}
				: {setter: 'setVideoBitrate', type: 'delete'},
			...(resolvedCodec === 'prores'
				? ([
						proResProfile === null
							? {setter: 'setProResProfile', type: 'delete'}
							: {
									setter: 'setProResProfile',
									type: 'set',
									value: proResProfile,
								},
					] satisfies ConfigUpdate[])
				: []),
			...(resolvedCodec === 'h264'
				? ([
						x264Preset === null
							? {setter: 'setX264Preset', type: 'delete'}
							: {
									setter: 'setX264Preset',
									type: 'set',
									value: x264Preset,
								},
					] satisfies ConfigUpdate[])
				: []),
			audioCodec === null
				? {setter: 'setAudioCodec', type: 'delete'}
				: {setter: 'setAudioCodec', type: 'set', value: audioCodec},
			{setter: 'setConcurrency', type: 'set', value: concurrency},
			beepOnFinish
				? {setter: 'setBeepOnFinish', type: 'set', value: true}
				: {setter: 'setBeepOnFinish', type: 'delete'},
		];

		return allUpdates.filter((update) => editedSetters.has(update.setter));
	}, [
		audioCodec,
		beepOnFinish,
		codec,
		concurrency,
		crf,
		editedSetters,
		proResProfile,
		qualityMode,
		resolvedCodec,
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
			<SettingsRow settingId="codec">
				<div style={rightRow}>
					<Combobox
						values={codecValues}
						selectedId={codec ?? REMOTION_DEFAULT}
						aria-label={settingsCatalog.codec.name}
					/>
				</div>
			</SettingsRow>
			<SettingsNumber
				settingId="scale"
				max={null}
				value={scale}
				onValueChanged={changeScale}
				min={0.1}
				step={0.1}
			/>
			<SettingsRow settingId="stillImageFormat">
				<div style={rightRow}>
					<Combobox
						values={stillFormatValues}
						selectedId={stillImageFormat ?? REMOTION_DEFAULT}
						aria-label={settingsCatalog.stillImageFormat.name}
					/>
				</div>
			</SettingsRow>
			<SettingsRow settingId="videoImageFormat">
				<div style={rightRow}>
					<Combobox
						values={videoFormatValues}
						selectedId={videoImageFormat ?? REMOTION_DEFAULT}
						aria-label={settingsCatalog.videoImageFormat.name}
					/>
				</div>
			</SettingsRow>
			<p style={sectionTitle}>Encoding</p>
			{BrowserSafeApis.codecSupportsCrf(resolvedCodec) &&
			BrowserSafeApis.codecSupportsVideoBitrate(resolvedCodec) ? (
				<SettingsRow settingId="qualityControl">
					<div style={rightRow}>
						<SegmentedControl items={qualityModeValues} needsWrapping />
					</div>
				</SettingsRow>
			) : null}
			{qualityMode === 'crf' &&
			BrowserSafeApis.codecSupportsCrf(resolvedCodec) &&
			BrowserSafeApis.getValidCrfRanges(resolvedCodec) ? (
				<SettingsNumber
					settingId="crf"
					value={crf}
					onValueChanged={changeCrf}
					min={BrowserSafeApis.getValidCrfRanges(resolvedCodec)[0]}
					max={BrowserSafeApis.getValidCrfRanges(resolvedCodec)[1]}
					step={1}
				/>
			) : null}
			{qualityMode === 'bitrate' &&
			BrowserSafeApis.codecSupportsVideoBitrate(resolvedCodec) ? (
				<SettingsRow settingId="videoBitrate">
					<div style={rightRow}>
						<RemotionInput
							aria-label={settingsCatalog.videoBitrate.name}
							style={{...input, ...fullWidth}}
							value={videoBitrate}
							onChange={onVideoBitrateChange}
							onBlur={onVideoBitrateBlur}
							status="ok"
							rightAlign
						/>
					</div>
				</SettingsRow>
			) : null}
			{resolvedCodec === 'prores' ? (
				<SettingsRow settingId="proResProfile">
					<div style={rightRow}>
						<Combobox
							values={profileValues}
							selectedId={proResProfile ?? REMOTION_DEFAULT}
							aria-label={settingsCatalog.proResProfile.name}
						/>
					</div>
				</SettingsRow>
			) : null}
			{resolvedCodec === 'h264' ? (
				<SettingsRow settingId="x264Preset">
					<div style={rightRow}>
						<Combobox
							values={presetValues}
							selectedId={x264Preset ?? REMOTION_DEFAULT}
							aria-label={settingsCatalog.x264Preset.name}
						/>
					</div>
				</SettingsRow>
			) : null}

			<p style={sectionTitle}>Audio</p>
			<SettingsRow settingId="audioCodec">
				<div style={rightRow}>
					<Combobox
						values={audioCodecValues}
						selectedId={audioCodec ?? REMOTION_DEFAULT}
						aria-label={settingsCatalog.audioCodec.name}
					/>
				</div>
			</SettingsRow>
			<p style={sectionTitle}>Performance</p>
			<SettingsNumber
				settingId="concurrency"
				value={concurrency}
				onValueChanged={changeConcurrency}
				min={renderDefaults.minConcurrency}
				max={renderDefaults.maxConcurrency}
				step={1}
			/>
			<p style={sectionTitle}>Notifications</p>
			<SettingsRow settingId="beepOnFinish">
				<div style={rightRow}>
					<Checkbox
						inputId="remotion-setting-beepOnFinish-control"
						checked={beepOnFinish}
						name="Beep when render finishes"
						onChange={(event) => {
							setBeepOnFinish(event.target.checked);
							markEdited('setBeepOnFinish');
						}}
					/>
				</div>
			</SettingsRow>
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
