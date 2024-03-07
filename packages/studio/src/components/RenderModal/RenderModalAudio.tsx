import type {AudioCodec, Codec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import {Checkmark} from '../../icons/Checkmark';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {RemotionInput} from '../NewComposition/RemInput';
import {EnforceAudioTrackSetting} from './EnforceAudioTrackSetting';
import {humanReadableAudioCodec} from './human-readable-audio-codecs';
import {input, label, optionRow, rightRow} from './layout';
import {MutedSetting} from './MutedSetting';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalHr} from './RenderModalHr';
import {SeparateAudioOption} from './SeparateAudioOption';

const container: React.CSSProperties = {
	flex: 1,
};

export const RenderModalAudio: React.FC<{
	muted: boolean;
	setMuted: React.Dispatch<React.SetStateAction<boolean>>;
	renderMode: RenderType;
	enforceAudioTrack: boolean;
	setEnforceAudioTrackState: React.Dispatch<React.SetStateAction<boolean>>;
	forSeamlessAacConcatenation: boolean;
	setForSeamlessAacConcatenation: React.Dispatch<React.SetStateAction<boolean>>;
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
	setSeparateAudioTo: React.Dispatch<React.SetStateAction<string | null>>;
	separateAudioTo: string | null;
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
	forSeamlessAacConcatenation,
	setForSeamlessAacConcatenation,
	separateAudioTo,
	setSeparateAudioTo,
}) => {
	const onShouldHaveTargetAudioBitrateChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setShouldHaveCustomTargetAudioBitrate(e.target.checked);
		},
		[setShouldHaveCustomTargetAudioBitrate],
	);

	const onTargetAudioBitrateChanged: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setCustomTargetAudioBitrateValue(e.target.value);
			},
			[setCustomTargetAudioBitrateValue],
		);

	const onSeamlessAacConcatenationChanges = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setForSeamlessAacConcatenation(e.target.checked);
		},
		[setForSeamlessAacConcatenation],
	);

	const audioCodecOptions = useCallback(
		(currentCodec: Codec): ComboboxValue[] => {
			return BrowserSafeApis.supportedAudioCodecs[currentCodec].map(
				(audioCodecOption: AudioCodec) => {
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
				},
			);
		},
		[codec, setAudioCodec],
	);

	return (
		<div style={container}>
			{renderMode === 'video' && audioCodecOptions(codec).length >= 2 ? (
				<div style={optionRow}>
					<div style={label}>
						Audio Codec <Spacing x={0.5} />
						<OptionExplainerBubble id="audioCodecOption" />
					</div>
					<div style={rightRow}>
						<Combobox
							values={audioCodecOptions(codec)}
							selectedId={audioCodec}
							title="AudioCodec"
						/>
					</div>
				</div>
			) : null}

			{renderMode === 'video' ? (
				<MutedSetting
					enforceAudioTrack={enforceAudioTrack}
					muted={muted}
					setMuted={setMuted}
				/>
			) : null}

			{(renderMode === 'video' || renderMode === 'audio') && (
				<>
					<EnforceAudioTrackSetting
						muted={muted}
						enforceAudioTrack={enforceAudioTrack}
						setEnforceAudioTrack={setEnforceAudioTrackState}
					/>
					<RenderModalHr />
				</>
			)}
			{renderMode === 'video' ? (
				<SeparateAudioOption
					separateAudioTo={separateAudioTo}
					setSeparateAudioTo={setSeparateAudioTo}
				/>
			) : null}
			<div style={optionRow}>
				<div style={label}>
					For seamless AAC concatenation
					<Spacing x={0.5} />
					<OptionExplainerBubble id="forSeamlessAacConcatenationOption" />
				</div>

				<div style={rightRow}>
					<Checkbox
						disabled={false}
						checked={forSeamlessAacConcatenation}
						onChange={onSeamlessAacConcatenationChanges}
						name="enforce-audio-track"
					/>
				</div>
			</div>

			{renderMode === 'still' ? null : (
				<div style={optionRow}>
					<div style={label}>
						Custom audio bitrate{' '}
						<OptionExplainerBubble id="audioBitrateOption" />
					</div>
					<div style={rightRow}>
						<Checkbox
							checked={shouldHaveCustomTargetAudioBitrate}
							onChange={onShouldHaveTargetAudioBitrateChanged}
							name="custom-audio-bitrate"
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
								status="ok"
								rightAlign
							/>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};
