import type {ChangeEvent} from 'react';
import {useCallback} from 'react';
import {Checkbox} from '../Checkbox';
import {RemotionInput} from '../NewComposition/RemInput';
import {EnforceAudioTrackSetting} from './EnforceAudioTrackSetting';
import {input, label, optionRow, rightRow} from './layout';
import {MutedSetting} from './MutedSetting';
import type {RenderType} from './RenderModalAdvanced';

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
	return (
		<div>
			{renderMode === 'video' && (
				<MutedSetting muted={muted} setMuted={setMuted} />
			)}
			{renderMode === 'video' && (
				<EnforceAudioTrackSetting
					enforceAudioTrack={enforceAudioTrack}
					setEnforceAudioTrack={setEnforceAudioTrackState}
				/>
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
