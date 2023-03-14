import type {AudioCodec, Codec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import {Checkmark} from '../../icons/Checkmark';
import {Checkbox} from '../Checkbox';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {RemotionInput} from '../NewComposition/RemInput';
import {EnforceAudioTrackSetting} from './EnforceAudioTrackSetting';
import {humanReadableAudioCodec} from './human-readable-audio-codecs';
import {input, label, optionRow, rightRow} from './layout';
import {MutedSetting} from './MutedSetting';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalHr} from './RenderModalHr';

export const RenderModalAudio: React.FC<{
	muted: boolean;
	setMuted: React.Dispatch<React.SetStateAction<boolean>>;
	renderMode: RenderType;
	enforceAudioTrack: boolean;
	setEnforceAudioTrackState: React.Dispatch<React.SetStateAction<boolean>>;
	shouldHaveCustomTargetAudioBitrate: boolean;
	setShouldHaveCustomTargetAudioBitrate: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	setCustomTargetAudioBitrateValue: React.Dispatch<
		React.SetStateAction<string>
	>;
	customTargetAudioBitrate: string;
	audioCodec: AudioCodec;
	setAudioCodec: (newAudioCodec: AudioCodec) => void;
	codec: Codec;
}> = ({
	muted,
	setMuted,
	renderMode,
	enforceAudioTrack,
	setEnforceAudioTrackState,
	setShouldHaveCustomTargetAudioBitrate,
	shouldHaveCustomTargetAudioBitrate,
	setCustomTargetAudioBitrateValue,
	customTargetAudioBitrate,
	audioCodec,
	codec,
	setAudioCodec,
}) => {
	const onShouldHaveTargetAudioBitrateChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setShouldHaveCustomTargetAudioBitrate(e.target.checked);
		},
		[setShouldHaveCustomTargetAudioBitrate]
	);

	const onTargetAudioBitrateChanged: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setCustomTargetAudioBitrateValue(e.target.value);
			},
			[setCustomTargetAudioBitrateValue]
		);

	const audioCodecOptions = useCallback(
		(currentCodec: Codec): ComboboxValue[] => {
			return BrowserSafeApis.supportedAudioCodecs[currentCodec].map(
				(audioCodecOption) => {
					return {
						label: humanReadableAudioCodec(audioCodecOption),
						onClick: () => setAudioCodec(audioCodecOption),
						key: audioCodecOption,
						leftItem: codec === audioCodecOption ? <Checkmark /> : null,
						id: audioCodecOption,
						keyHint: null,
						quickSwitcherLabel: null,
						subMenu: null,
						type: 'item',
						value: audioCodecOption,
					};
				}
			);
		},
		[codec, setAudioCodec]
	);

	return (
		<div>
			{renderMode === 'video' && audioCodecOptions(codec).length >= 2 ? (
				<div style={optionRow}>
					<div style={label}>Audio Codec</div>
					<div style={rightRow}>
						<Combobox
							values={audioCodecOptions(codec)}
							selectedId={audioCodec}
							title="AudioCodec"
						/>
					</div>
				</div>
			) : null}

			{renderMode === 'video' && (
				<>
					<MutedSetting
						enforceAudioTrack={enforceAudioTrack}
						muted={muted}
						setMuted={setMuted}
					/>
					<EnforceAudioTrackSetting
						muted={muted}
						enforceAudioTrack={enforceAudioTrack}
						setEnforceAudioTrack={setEnforceAudioTrackState}
					/>
					<RenderModalHr />
				</>
			)}

			{renderMode === 'still' ? null : (
				<div style={optionRow}>
					<div style={label}>Custom audio bitrate</div>
					<div style={rightRow}>
						<Checkbox
							checked={shouldHaveCustomTargetAudioBitrate}
							onChange={onShouldHaveTargetAudioBitrateChanged}
						/>
					</div>
				</div>
			)}

			{shouldHaveCustomTargetAudioBitrate && renderMode !== 'still' ? (
				<div style={optionRow}>
					<div style={label}>Target audio bitrate</div>
					<div style={rightRow}>
						<div>
							<RemotionInput
								style={input}
								value={customTargetAudioBitrate}
								onChange={onTargetAudioBitrateChanged}
							/>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};
