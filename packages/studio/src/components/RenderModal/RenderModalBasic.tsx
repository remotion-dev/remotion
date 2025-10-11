import type {Codec, LogLevel, ProResProfile} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactAPIs} from '@remotion/renderer/pure';
import type {ChangeEvent} from 'react';
import React, {useCallback, useMemo} from 'react';
import type {VideoConfig} from 'remotion';
import {labelProResProfile} from '../../helpers/prores-labels';
import {useFileExistence} from '../../helpers/use-file-existence';
import {Checkmark} from '../../icons/Checkmark';
import {Checkbox} from '../Checkbox';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {InputDragger} from '../NewComposition/InputDragger';
import {RightAlignInput} from '../NewComposition/RemInput';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {Spacing} from '../layout';
import {FrameRangeSetting} from './FrameRangeSetting';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalOutputName} from './RenderModalOutputName';
import {humanReadableCodec} from './human-readable-codec';
import {input, label, optionRow, rightRow} from './layout';

const container: React.CSSProperties = {
	flex: 1,
};

export const RenderModalBasic: React.FC<{
	readonly renderMode: RenderType;
	readonly imageFormatOptions: SegmentedControlItem[];
	readonly codec: Codec;
	readonly setVideoCodec: (newCodec: Codec) => void;
	readonly outName: string;
	readonly proResProfile: ProResProfile | null;
	readonly setProResProfile: React.Dispatch<
		React.SetStateAction<ProResProfile>
	>;
	readonly frame: number;
	readonly setFrame: React.Dispatch<React.SetStateAction<number>>;
	readonly resolvedComposition: VideoConfig;
	readonly setOutName: (value: React.SetStateAction<string>) => void;
	readonly setEndFrame: React.Dispatch<React.SetStateAction<number | null>>;
	readonly startFrame: number;
	readonly endFrame: number;
	readonly setStartFrame: React.Dispatch<React.SetStateAction<number | null>>;
	readonly validationMessage: string | null;
	readonly setVerboseLogging: React.Dispatch<React.SetStateAction<LogLevel>>;
	readonly logLevel: LogLevel;
}> = ({
	renderMode,
	imageFormatOptions,
	outName,
	codec,
	setVideoCodec: setCodec,
	proResProfile,
	setProResProfile,
	frame,
	setFrame,
	resolvedComposition,
	setOutName,
	setEndFrame,
	endFrame,
	setStartFrame,
	startFrame,
	validationMessage,
	setVerboseLogging,
	logLevel,
}) => {
	const existence = useFileExistence(outName);
	const videoCodecOptions = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.validCodecs
			.filter((c) => {
				return NoReactAPIs.isAudioCodec(c) === (renderMode === 'audio');
			})
			.map((codecOption) => {
				return {
					label: humanReadableCodec(codecOption),
					onClick: () => setCodec(codecOption),
					key: codecOption,
					leftItem: codec === codecOption ? <Checkmark /> : null,
					id: codecOption,
					keyHint: null,
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item',
					value: codecOption,
				};
			});
	}, [renderMode, setCodec, codec]);

	const proResProfileOptions = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.proResProfileOptions.map((option) => {
			return {
				label: labelProResProfile(option),
				onClick: () => setProResProfile(option),
				key: option,
				selected: proResProfile === option,
				type: 'item',
				id: option,
				keyHint: null,
				leftItem: null,
				quickSwitcherLabel: null,
				subMenu: null,
				value: option,
			};
		});
	}, [proResProfile, setProResProfile]);

	const onFrameSetDirectly = useCallback(
		(newFrame: number) => {
			setFrame(newFrame);
		},
		[setFrame],
	);

	const onFrameChanged = useCallback(
		(e: string) => {
			setFrame((q) => {
				const newFrame = parseFloat(e);
				if (Number.isNaN(newFrame)) {
					return q;
				}

				return newFrame;
			});
		},
		[setFrame],
	);

	const onValueChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setOutName(e.target.value);
		},
		[setOutName],
	);

	const onVerboseLoggingChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setVerboseLogging(e.target.checked ? 'verbose' : 'info');
		},
		[setVerboseLogging],
	);

	return (
		<div style={container}>
			{renderMode === 'still' || renderMode === 'sequence' ? (
				<div style={optionRow}>
					<div style={label}>Format</div>
					<div style={rightRow}>
						<SegmentedControl items={imageFormatOptions} needsWrapping />
					</div>
				</div>
			) : (
				<div style={optionRow}>
					<div style={label}>
						Codec
						<Spacing x={0.5} />
						<OptionExplainerBubble id="videoCodecOption" />
					</div>

					<div style={rightRow}>
						<Combobox
							values={videoCodecOptions}
							selectedId={codec}
							title="Codec"
						/>
					</div>
				</div>
			)}
			{renderMode === 'still' && resolvedComposition.durationInFrames > 1 ? (
				<div style={optionRow}>
					<div style={label}>Frame</div>
					<div style={rightRow}>
						<RightAlignInput>
							<InputDragger
								value={frame}
								onTextChange={onFrameChanged}
								placeholder={`0-${resolvedComposition.durationInFrames - 1}`}
								onValueChange={onFrameSetDirectly}
								name="frame"
								step={1}
								min={0}
								status="ok"
								max={resolvedComposition.durationInFrames - 1}
								rightAlign
							/>
						</RightAlignInput>
					</div>
				</div>
			) : null}
			{renderMode === 'video' && codec === 'prores' ? (
				<div style={optionRow}>
					<div style={label}>ProRes profile</div>
					<div style={rightRow}>
						<Combobox
							title={'proResProfile' as string}
							selectedId={proResProfile as string}
							values={proResProfileOptions}
						/>
					</div>
				</div>
			) : null}
			{renderMode === 'still' ? null : (
				<FrameRangeSetting
					durationInFrames={resolvedComposition.durationInFrames}
					endFrame={endFrame}
					setEndFrame={setEndFrame}
					setStartFrame={setStartFrame}
					startFrame={startFrame}
				/>
			)}
			<RenderModalOutputName
				existence={existence}
				inputStyle={input}
				outName={outName}
				onValueChange={onValueChange}
				validationMessage={validationMessage}
				label={renderMode === 'sequence' ? 'Folder name' : 'Output name'}
			/>
			<div style={optionRow}>
				<div style={label}>
					Verbose logging <Spacing x={0.5} />
					<OptionExplainerBubble id="logLevelOption" />
				</div>
				<div style={rightRow}>
					<Checkbox
						checked={logLevel === 'verbose'}
						onChange={onVerboseLoggingChanged}
						name="verbose-logging"
					/>
				</div>
			</div>
		</div>
	);
};
