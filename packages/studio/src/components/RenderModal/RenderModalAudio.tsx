import type {AudioCodec, Codec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import {Checkmark} from '../../icons/Checkmark';
import {Checkbox} from '../Checkbox';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {RemotionInput} from '../NewComposition/RemInput';
import {Spacing} from '../layout';
import {EnforceAudioTrackSetting} from './EnforceAudioTrackSetting';
import {MutedSetting} from './MutedSetting';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalHr} from './RenderModalHr';
import {SeparateAudioOption} from './SeparateAudioOption';
import {humanReadableAudioCodec} from './human-readable-audio-codecs';
import {input, label, optionRow, rightRow} from './layout';

const container: React.CSSProperties = {
	flex: 1,
	overflowY: 'auto',
};

export const RenderModalAudio: React.FC<{
	readonly muted: boolean;
	readonly setMuted: React.Dispatch<React.SetStateAction<boolean>>;
	readonly renderMode: RenderType;
	readonly enforceAudioTrack: boolean;
	readonly setEnforceAudioTrackState: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly forSeamlessAacConcatenation: boolean;
	readonly setForSeamlessAacConcatenation: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly shouldHaveCustomTargetAudioBitrate: boolean;
	readonly setShouldHaveCustomTargetAudioBitrate: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly setCustomTargetAudioBitrateValue: React.Dispatch<
		React.SetStateAction<string>
	>;
	readonly customTargetAudioBitrate: string;
	readonly audioCodec: AudioCodec;
	readonly setAudioCodec: (newAudioCodec: AudioCodec) => void;
	readonly codec: Codec;
	readonly setSeparateAudioTo: React.Dispatch<
		React.SetStateAction<string | null>
	>;
	readonly separateAudioTo: string | null;
	readonly outName: string;
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
	outName,
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
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			{renderMode === 'video' ? (
				<>
					<MutedSetting
						enforceAudioTrack={enforceAudioTrack}
						muted={muted}
						setMuted={setMuted}
					/>
					<RenderModalHr />
				</>
			) : null}
			{renderMode === 'video' &&
			audioCodecOptions(codec).length >= 2 &&
			!muted ? (
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
			{(renderMode === 'video' || renderMode === 'audio') && !muted && (
				<>
					<EnforceAudioTrackSetting
						muted={muted}
						enforceAudioTrack={enforceAudioTrack}
						setEnforceAudioTrack={setEnforceAudioTrackState}
					/>
					<RenderModalHr />
				</>
			)}
			{renderMode === 'video' && !muted ? (
				<SeparateAudioOption
					separateAudioTo={separateAudioTo}
					setSeparateAudioTo={setSeparateAudioTo}
					audioCodec={audioCodec}
					outName={outName}
				/>
			) : null}
			{audioCodec === 'aac' && !muted ? (
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
			) : null}

			{renderMode === 'still' || muted ? null : (
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

			{shouldHaveCustomTargetAudioBitrate &&
			renderMode !== 'still' &&
			!muted ? (
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
